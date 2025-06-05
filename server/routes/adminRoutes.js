// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/users
 * @desc    List all users (omit passwords)
 * @access  Private (role === 'admin')
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    // Fetch all users, excluding password field
    const users = await User.find().select('-password');
    return res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user (with optional role)
 * @access  Private (role === 'admin')
 */
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role = 'individual' } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email & password are required' });
    }

    // Check for existing user by email OR username
    const existing = await User.findOne({ $or: [ { email }, { username } ] });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'User with that email or username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Create new user document
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role, // must be one of ['individual','organization_admin','researcher','admin']
      // demographics, consentToResearch, etc. can be added here as well if passed
    });

    const created = await newUser.save();

    // Exclude password from returned object
    const { password: pw, ...userData } = created.toObject();
    return res.status(201).json({ success: true, user: userData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update an existing user by ID
 * @access  Private (role === 'admin')
 */
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, role, demographics, consentToResearch } = req.body;

    // Find user to update
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update provided fields
    if (username) user.username = username.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (typeof role !== 'undefined') {
      // ensure role is one of the allowed enums
      if (!['individual','organization_admin','researcher','admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role value' });
      }
      user.role = role;
    }

    // Optionally update demographics subdocument
    if (demographics) {
      user.demographics = {
        age: demographics.age ?? user.demographics.age,
        gender: demographics.gender ?? user.demographics.gender,
        location: demographics.location ?? user.demographics.location,
        culturalBackground: demographics.culturalBackground ?? user.demographics.culturalBackground,
      };
    }

    // Optionally update consentToResearch
    if (typeof consentToResearch !== 'undefined') {
      user.consentToResearch = consentToResearch;
    }

    // If password was supplied, re‐hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updated = await user.save();
    // Exclude password before sending back
    const { password: pw, ...updatedData } = updated.toObject();
    return res.json({ success: true, user: updatedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user by ID
 * @access  Private (role === 'admin')
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }

    // Use findByIdAndDelete directly - it returns null if not found
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ success: true, message: 'User removed' });
  } catch (err) {
    console.error('Delete user error:', err);
    
    // Check if response has already been sent
    if (res.headersSent) {
      console.error('Response already sent, cannot send error response');
      return;
    }
    
    return res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;

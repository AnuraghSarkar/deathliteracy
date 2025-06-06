const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Create a new user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // 1) Validate required fields
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Username, email, and password are required');
  }

  // 2) Check for existing email or username
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(400);
    throw new Error('Email already in use');
  }
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    res.status(400);
    throw new Error('Username already in use');
  }

  // 3) Create new user document
  const user = await User.create({
    username,
    email,
    password,        // The pre-save hook in userModel will hash this
    role: role || 'individual'  // default to “individual” if no role specified
  });

  if (user) {
    // 4) Return the created user (omit password field)
    res.status(201).json({
      _id:       user._id,
      username:  user.username,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

module.exports = { createUser };

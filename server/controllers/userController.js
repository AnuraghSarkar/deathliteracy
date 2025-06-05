const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, demographics, consentToResearch } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      demographics,
      consentToResearch
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Detailed registration error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Mongoose validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists by email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // FIXED: Removed the syntax error and added return
      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ message: error.message });
  }
};

// @desc    Handle Google Login (for OAuth users)
// @route   GET /api/users/auth/google/callback
// @access  Public (Google OAuth flow)
const googleLogin = async (req, res) => {
  try {
    const googleId = req.user.googleId;
    const username = req.user.username;
    const email = req.user.email;

    // Check if user already exists in the database
    let user = await User.findOne({ googleId });

    if (!user) {
      // If user doesn't exist, create a new user
      user = new User({
        username,
        email,
        googleId,
        password: Math.random().toString(36).slice(-8),
        role: 'individual', // Fixed: changed from 'user' to 'individual'
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send token back to frontend
    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      token: token
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

// @desc    Get logged‐in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        demographics: user.demographics || {},
        consentToResearch: user.consentToResearch || false,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(404).json({ message: error.message });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update fields if they were sent in req.body
    user.username = req.body.username ?? user.username;
    user.email = req.body.email ?? user.email;
    user.demographics = req.body.demographics ?? user.demographics;
    user.consentToResearch = req.body.consentToResearch ?? user.consentToResearch;

    // If they included a new password, hash that too:
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Return updated profile (minus password)
    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      demographics: updatedUser.demographics,
      consentToResearch: updatedUser.consentToResearch,
      hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// @desc    Mark onboarding as completed
// @route   PUT /api/users/complete-onboarding
// @access  Private
const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { hasCompletedOnboarding: true },
      { new: true }
    ).select('-password');

    if (user) {
      return res.json({
        success: true,
        message: 'Onboarding completed successfully',
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          hasCompletedOnboarding: user.hasCompletedOnboarding
        }
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  completeOnboarding,
  updateUserProfile
};
const User = require('../models/userModel');
const jwt = require('jsonwebtoken'); // Ensure JWT is imported

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
        token: generateToken(user._id)
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
    const user = await User.findOne({ email }).select('+password');  // Ensure password is included for comparison

    if (user && (await user.matchPassword(password))) {
      // Generate JWT if the passwords match
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Handle Google Login (for OAuth users)
// @route   GET /api/users/auth/google/callback
// @access  Public (Google OAuth flow)
const googleLogin = async (req, res) => {
  try {
    // Assuming 'req.user' is populated with the Google user after authentication
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
        password: Math.random().toString(36).slice(-8),  // Random password
        role: 'user', // Default role
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send token back to frontend
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        demographics: user.demographics,
        consentToResearch: user.consentToResearch,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
};

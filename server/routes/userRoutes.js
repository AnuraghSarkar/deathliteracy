const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Add this line
const router = express.Router();
const { registerUser, loginUser, getUserProfile, completeOnboarding, updateUserProfile } = require('../controllers/userController');  // ADD completeOnboarding
const { protect } = require('../middleware/authMiddleware');
// Register user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Complete onboarding (protected route)  // ADD THIS ROUTE
router.put('/complete-onboarding', protect, completeOnboarding);

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    
    try {
      // Generate JWT token after Google login
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      // Fetch complete user data from database (including hasCompletedOnboarding)
      const User = require('../models/userModel');
      const fullUser = await User.findById(req.user._id).select('-password');
      
      // Send complete user data (like regular login)
      const userData = {
        _id: fullUser._id,
        username: fullUser.username,
        email: fullUser.email,
        role: fullUser.role,
        hasCompletedOnboarding: fullUser.hasCompletedOnboarding,
        token: token
      };
      
      
      // Redirect with complete user data
      const redirectURL = `http://localhost:3000/oauth-callback?userData=${encodeURIComponent(JSON.stringify(userData))}`;
      res.redirect(redirectURL);
      
    } catch (error) {
      res.redirect('http://localhost:3000/login?error=oauth_failed');
    }
  }
);
// GET profile (fetch)
router.get('/profile', protect, getUserProfile);

// PUT profile (update)
router.put('/profile', protect, updateUserProfile);

module.exports = router;
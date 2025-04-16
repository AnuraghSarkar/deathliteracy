const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Add this line
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Register user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Google OAuth route
// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token after Google login
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Send the token to the frontend
    res.redirect(`http://localhost:3000/oauth-callback?token=${token}`);
  }
);

// Get user profile (protected route)
router.get('/profile', protect, getUserProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, completeOnboarding, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Register user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Complete onboarding (protected route)
router.put('/complete-onboarding', protect, completeOnboarding);

// GET profile (fetch)
router.get('/profile', protect, getUserProfile);

// PUT profile (update)
router.put('/profile', protect, updateUserProfile);

module.exports = router;
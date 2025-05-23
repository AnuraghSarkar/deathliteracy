const express = require('express');
const router = express.Router();
const {
  saveAssessmentResult,
  getUserAssessments,
  getAssessmentById,
  getAssessmentStats,
  deleteAssessment
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

// Optional middleware for auth - allows anonymous assessments
const optionalAuth = (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const User = require('../models/userModel');
      const jwt = require('jsonwebtoken');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).select('-password').then(user => {
        req.user = user;
        next();
      }).catch(() => {
        req.user = null;
        next();
      });
    } catch (error) {
      req.user = null;
      next();
    }
  } else {
    req.user = null;
    next();
  }
};

// Public/Semi-public routes
router.post('/', optionalAuth, saveAssessmentResult); // Save assessment (can be anonymous)
router.get('/:id', optionalAuth, getAssessmentById); // Get specific assessment

// Protected routes (require login)
router.get('/user/history', protect, getUserAssessments); // Get user's assessment history
router.delete('/:id', protect, deleteAssessment); // Delete user's assessment

// Admin routes
router.get('/admin/stats', protect, getAssessmentStats); // Get statistics (admin only)

module.exports = router;
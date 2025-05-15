const express = require('express');
const router = express.Router();
const Question = require('../models/questionModel');
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

// Middleware to restrict routes to admin only
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithAssessments = await User.find({ 'assessments.0': { $exists: true } }).countDocuments();
    
    // Mock data for now - in a real app, you would calculate these from your database
    const statsData = {
      totalUsers,
      totalAssessments: 98,
      averageScore: 72,
      completionRate: Math.round((usersWithAssessments / totalUsers) * 100) || 68,
    };
    
    res.json(statsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate reports
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get('/reports', protect, admin, async (req, res) => {
  try {
    const { type, dateRange } = req.query;
    
    // For now, return mock data
    // In a real app, you would query your database based on the report type and date range
    const mockReport = {
      type,
      dateRange,
      generatedAt: new Date().toISOString(),
      data: {
        totalParticipants: 98,
        averageScore: 72,
        demographicBreakdown: {
          "18-30": 22,
          "31-45": 35,
          "46-60": 28,
          "61+": 13,
        },
        scoreDistribution: {
          "Low (0-40%)": 15,
          "Medium (41-70%)": 38,
          "High (71-100%)": 45,
        },
        topStrengthAreas: [
          "Understanding grief processes",
          "Knowledge of funeral planning",
          "Comfort discussing death",
        ],
        improvementAreas: [
          "Legal aspects of end-of-life planning",
          "Palliative care options",
          "Supporting others through bereavement",
        ],
      },
    };
    
    res.json(mockReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
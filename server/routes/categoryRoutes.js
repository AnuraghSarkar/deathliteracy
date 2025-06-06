// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/categories
 * @desc    Get all available question categories
 * @access  Private (Admin only)
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    // These match your question model's category enum
    const categories = [
      'Demographics',
      'Experiences',
      'Social Connection',
      'Practical Knowledge',
      'Experiential Knowledge',
      'Factual Knowledge',
      'Community Knowledge',
      'Death Competency'
    ];

    return res.json({ 
      success: true, 
      categories 
    });
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching categories' 
    });
  }
});

/**
 * @route   GET /api/admin/categories/subcategories
 * @desc    Get all available subcategories
 * @access  Private (Admin only)
 */
router.get('/subcategories', protect, isAdmin, async (req, res) => {
  try {
    // These match your question model's subcategory enum
    const subcategories = [
      'Talking Support',
      'Hands-on Care',
      'Learning from Experience',
      'Factual Understanding',
      'Accessing Help',
      'Community Support Groups'
    ];

    return res.json({ 
      success: true, 
      subcategories 
    });
  } catch (err) {
    console.error('Get subcategories error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching subcategories' 
    });
  }
});

module.exports = router;
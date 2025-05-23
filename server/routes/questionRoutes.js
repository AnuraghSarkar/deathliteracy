const express = require('express');
const router = express.Router();
const { 
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getQuestions);
router.get('/:id', getQuestionById);

// Admin-only routes (protected)
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;
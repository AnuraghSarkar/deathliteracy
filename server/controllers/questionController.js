const Question = require('../models/questionModel');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v -createdAt -updatedAt');

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
      error: error.message
    });
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question',
      error: error.message
    });
  }
};

// @desc    Create new question (Admin only)
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const {
      questionId,
      text,
      type,
      options,
      category,
      subcategory,
      parentQuestion,
      parentText,
      conditionalLogic,
      order
    } = req.body;

    // Check if questionId already exists
    const existingQuestion = await Question.findOne({ questionId });
    if (existingQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Question ID already exists'
      });
    }

    const question = await Question.create({
      questionId,
      text,
      type,
      options: options || [],
      category,
      subcategory,
      parentQuestion,
      parentText,
      conditionalLogic,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question',
      error: error.message
    });
  }
};

// @desc    Update question (Admin only)
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const {
      text,
      type,
      options,
      category,
      subcategory,
      parentQuestion,
      parentText,
      conditionalLogic,
      order,
      isActive
    } = req.body;

    // Update fields
    if (text !== undefined) question.text = text;
    if (type !== undefined) question.type = type;
    if (options !== undefined) question.options = options;
    if (category !== undefined) question.category = category;
    if (subcategory !== undefined) question.subcategory = subcategory;
    if (parentQuestion !== undefined) question.parentQuestion = parentQuestion;
    if (parentText !== undefined) question.parentText = parentText;
    if (conditionalLogic !== undefined) question.conditionalLogic = conditionalLogic;
    if (order !== undefined) question.order = order;
    if (isActive !== undefined) question.isActive = isActive;

    const updatedQuestion = await question.save();

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question',
      error: error.message
    });
  }
};

// @desc    Delete question (Admin only)
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question',
      error: error.message
    });
  }
};

// @desc    Get questions by category
// @route   GET /api/questions/category/:category
// @access  Public
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const questions = await Question.find({ 
      category: { $regex: new RegExp(category, 'i') },
      isActive: true 
    }).sort({ order: 1 });

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
      error: error.message
    });
  }
};

// @desc    Bulk import questions (Admin only)
// @route   POST /api/questions/bulk-import
// @access  Private/Admin
const bulkImportQuestions = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions'
      });
    }

    // Validate each question
    const validationErrors = [];
    questions.forEach((q, index) => {
      if (!q.questionId || !q.text || !q.type || !q.category) {
        validationErrors.push(`Question ${index + 1}: Missing required fields`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Clear existing questions and insert new ones
    await Question.deleteMany({});
    const insertedQuestions = await Question.insertMany(questions);

    res.json({
      success: true,
      message: `Successfully imported ${insertedQuestions.length} questions`,
      count: insertedQuestions.length
    });
  } catch (error) {
    console.error('Error bulk importing questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while importing questions',
      error: error.message
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCategory,
  bulkImportQuestions
};
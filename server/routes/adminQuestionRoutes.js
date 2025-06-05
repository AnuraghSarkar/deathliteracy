// routes/adminQuestionRoutes.js
const express = require('express');
const router = express.Router();
const Question = require('../models/questionModel');
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/questions
 * @desc    Get all questions (including inactive) for admin management
 * @access  Private (Admin only)
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    // Get all questions (including inactive) with full details
    const questions = await Question.find({})
      .sort({ category: 1, order: 1 })
      .select('-__v');

    // Transform the data to match frontend expectations
    const transformedQuestions = questions.map(q => ({
      _id: q._id,
      questionText: q.text, // Map 'text' to 'questionText' for frontend
      type: q.type,
      category: q.category,
      subcategory: q.subcategory,
      options: q.options,
      correctAnswer: q.correctAnswer || '', 
      isActive: q.isActive,
      points: q.scoringInfo?.maxScore || 1,
      order: q.order,
      questionId: q.questionId,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));

    return res.json({ 
      success: true, 
      questions: transformedQuestions,
      count: transformedQuestions.length 
    });
  } catch (err) {
    console.error('Admin get questions error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching questions' 
    });
  }
});

/**
 * @route   POST /api/admin/questions
 * @desc    Create a new question
 * @access  Private (Admin only)
 */
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { 
      questionText, 
      type, 
      category, 
      subcategory,
      options, 
      correctAnswer, 
      isActive, 
      points 
    } = req.body;

    // Basic validation
    if (!questionText || !type || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Question text, type, and category are required' 
      });
    }

    // Generate unique questionId
    const questionCount = await Question.countDocuments();
    const questionId = `Q${(questionCount + 1).toString().padStart(3, '0')}`;

    // Process options based on type
    let processedOptions = [];
    if (type === 'multiple_choice' && options && Array.isArray(options)) {
      processedOptions = options.map((opt, index) => ({
        value: index + 1,
        label: opt
      }));
    } else if (type === 'true_false') {
      processedOptions = [
        { value: true, label: 'True' },
        { value: false, label: 'False' }
      ];
    } else if (type === 'scale') {
      processedOptions = [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' }
      ];
    }

    // Map frontend type to backend enum
    const typeMapping = {
      'multiple_choice': 'single_choice',
      'true_false': 'boolean',
      'scale': 'scale',
      'text': 'scale' // Default fallback
    };

    const mappedType = typeMapping[type] || type;

    // Determine order
    const maxOrder = await Question.findOne({}, {}, { sort: { 'order': -1 } });
    const nextOrder = maxOrder ? maxOrder.order + 1 : 1;

    // Create question
    const newQuestion = new Question({
      questionId,
      text: questionText,
      type: mappedType,
      options: processedOptions,
      category,
      subcategory: subcategory || undefined,
      order: nextOrder,
      isActive: isActive !== undefined ? isActive : true,
      scoringInfo: {
        isDLIQuestion: ['Practical Knowledge', 'Experiential Knowledge', 'Factual Knowledge', 'Community Knowledge'].includes(category),
        dliDomain: ['Practical Knowledge', 'Experiential Knowledge', 'Factual Knowledge', 'Community Knowledge'].includes(category) ? category : undefined,
        maxScore: points || 5,
        scaleType: type === 'scale' ? 'agreement_scale' : 'ability_scale'
      }
    });

    const savedQuestion = await newQuestion.save();

    // Transform response to match frontend expectations
    const responseQuestion = {
      _id: savedQuestion._id,
      questionText: savedQuestion.text,
      type: type, // Send back original type
      category: savedQuestion.category,
      subcategory: savedQuestion.subcategory,
      options: options || [],
      correctAnswer: correctAnswer || '',
      isActive: savedQuestion.isActive,
      points: savedQuestion.scoringInfo?.maxScore || 1,
      order: savedQuestion.order,
      questionId: savedQuestion.questionId
    };

    return res.status(201).json({ 
      success: true, 
      message: 'Question created successfully',
      question: responseQuestion 
    });
  } catch (err) {
    console.error('Admin create question error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Question ID already exists' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error while creating question' 
    });
  }
});

/**
 * @route   PUT /api/admin/questions/:id
 * @desc    Update an existing question
 * @access  Private (Admin only)
 */
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const questionId = req.params.id;
    const { 
      questionText, 
      type, 
      category, 
      subcategory,
      options, 
      correctAnswer, 
      isActive, 
      points 
    } = req.body;

    // Find question to update
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    // Process options based on type
    let processedOptions = question.options; // Keep existing if not provided
    if (options) {
      if (type === 'multiple_choice' && Array.isArray(options)) {
        processedOptions = options.map((opt, index) => ({
          value: index + 1,
          label: opt
        }));
      } else if (type === 'true_false') {
        processedOptions = [
          { value: true, label: 'True' },
          { value: false, label: 'False' }
        ];
      } else if (type === 'scale') {
        processedOptions = [
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
          { value: 4, label: '4' },
          { value: 5, label: '5' }
        ];
      }
    }

    // Map frontend type to backend enum
    const typeMapping = {
      'multiple_choice': 'single_choice',
      'true_false': 'boolean',
      'scale': 'scale',
      'text': 'scale'
    };

    // Update fields
    if (questionText !== undefined) question.text = questionText;
    if (type !== undefined) question.type = typeMapping[type] || type;
    if (category !== undefined) question.category = category;
    if (subcategory !== undefined) question.subcategory = subcategory;
    if (processedOptions !== undefined) question.options = processedOptions;
    if (isActive !== undefined) question.isActive = isActive;
    
    // Update scoring info
    if (points !== undefined) {
      question.scoringInfo = {
        ...question.scoringInfo,
        maxScore: points
      };
    }

    const updatedQuestion = await question.save();

    // Transform response
    const responseQuestion = {
      _id: updatedQuestion._id,
      questionText: updatedQuestion.text,
      type: type || question.type,
      category: updatedQuestion.category,
      subcategory: updatedQuestion.subcategory,
      options: type === 'multiple_choice' ? options : [],
      correctAnswer: correctAnswer || '',
      isActive: updatedQuestion.isActive,
      points: updatedQuestion.scoringInfo?.maxScore || 1,
      order: updatedQuestion.order,
      questionId: updatedQuestion.questionId
    };

    return res.json({ 
      success: true, 
      message: 'Question updated successfully',
      question: responseQuestion 
    });
  } catch (err) {
    console.error('Admin update question error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while updating question' 
    });
  }
});

/**
 * @route   DELETE /api/admin/questions/:id
 * @desc    Delete a question by ID
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    await Question.findByIdAndDelete(questionId);
    
    return res.json({ 
      success: true, 
      message: 'Question deleted successfully' 
    });
  } catch (err) {
    console.error('Admin delete question error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while deleting question' 
    });
  }
});

module.exports = router;
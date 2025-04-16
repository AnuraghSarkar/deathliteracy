const Question = require('../models/questionModel');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    const { text, type, options, category, correctAnswers, feedbackGeneral } = req.body;

    const question = await Question.create({
      text,
      type,
      options,
      category,
      correctAnswers,
      feedbackGeneral
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const { text, type, options, category, correctAnswers, feedbackGeneral } = req.body;

    const question = await Question.findById(req.params.id);

    if (question) {
      question.text = text || question.text;
      question.type = type || question.type;
      question.options = options || question.options;
      question.category = category || question.category;
      question.correctAnswers = correctAnswers || question.correctAnswers;
      question.feedbackGeneral = feedbackGeneral || question.feedbackGeneral;

      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question) {
      await question.deleteOne();
      res.json({ message: 'Question removed' });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
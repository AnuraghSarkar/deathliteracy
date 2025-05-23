const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: [true, 'Question ID is required'],
    unique: true
  },
  text: {
    type: String,
    required: [true, 'Question text is required']
  },
  type: {
    type: String,
    enum: ['scale', 'multiselect', 'boolean', 'single_choice', 'grid'],
    required: true
  },
  options: [{
    value: mongoose.Schema.Types.Mixed,
    label: String
  }],
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: false
  },
  parentQuestion: {
    type: String,
    required: false
  },
  parentText: {
    type: String,
    required: false
  },
  conditionalLogic: {
    showIf: {
      questionId: String,
      value: mongoose.Schema.Types.Mixed
    }
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  correctAnswers: [mongoose.Schema.Types.Mixed],
  feedbackGeneral: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
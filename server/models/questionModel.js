// server/models/questionModel.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required']
  },
  type: {
    type: String,
    enum: ['scale', 'multiselect', 'boolean', 'single_choice'],
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
  correctAnswers: [mongoose.Schema.Types.Mixed],
  feedbackGeneral: String
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
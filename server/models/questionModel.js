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
    enum: ['scale', 'multiselect', 'boolean', 'single_choice', 'grid', 'likert_5'],
    required: true
  },
  options: [{
    value: mongoose.Schema.Types.Mixed,
    label: String
  }],
  
  // DLI-R Aligned Categories
  category: {
    type: String,
    enum: [
      'Demographics',
      'Experiences', 
      'Social Connection',
      'Practical Knowledge',      // DLI-R: Skills (8 items)
      'Experiential Knowledge',   // DLI-R: Experience (5 items) 
      'Factual Knowledge',        // DLI-R: Knowledge (7 items)
      'Community Knowledge',      // DLI-R: Action (9 items)
      'Death Competency'
    ],
    required: true
  },
  
  // DLI-R Subcategories
  subcategory: {
    type: String,
    enum: [
      'Talking Support',          // Q16 - 4 items (part of Practical Knowledge)
      'Hands-on Care',           // Q17 - 4 items (part of Practical Knowledge) 
      'Learning from Experience', // Q18 - 5 items (Experiential Knowledge)
      'Factual Understanding',    // Q19 - 7 items (Factual Knowledge)
      'Accessing Help',          // Q20 - 5 items (part of Community Knowledge)
      'Community Support Groups' // Q21 - 4 items (part of Community Knowledge)
    ],
    required: false
  },
  
  // DLI Scale Information
  dliScale: {
    type: String,
    enum: [
      'practical_talking',     // Q16 (1-5: not able at all to very able)
      'practical_hands_on',    // Q17 (1-5: not able at all to very able)
      'experiential',          // Q18 (1-5: do not agree at all to strongly agree)
      'factual',              // Q19 (1-5: do not agree at all to strongly agree)
      'community_help',       // Q20 (1-5: strongly disagree to strongly agree)
      'community_support'     // Q21 (1-5: strongly disagree to strongly agree)
    ],
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
  
  // DLI Scoring Information
  scoringInfo: {
    isDLIQuestion: {
      type: Boolean,
      default: false
    },
    dliDomain: {
      type: String,
      enum: ['Practical Knowledge', 'Experiential Knowledge', 'Factual Knowledge', 'Community Knowledge']
    },
    scaleType: {
      type: String,
      enum: ['ability_scale', 'agreement_scale'] // ability: 1-5 not able to very able, agreement: 1-5 disagree to agree
    },
    maxScore: {
      type: Number,
      default: 5
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
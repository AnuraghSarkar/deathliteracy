const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  // User information (optional - for anonymous assessments)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Demographics
  demographics: {
    country: String,
    state: String,
    location: String,
    age: String,
    gender: String,
    terminalIllness: String
  },
  
  // All user answers
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Calculated scores
  scores: {
    overall: Number,
    skills: Number,
    experience: Number,
    knowledge: Number,
    community: Number,
    socialConnection: Number
  },
  
  // Comparison with benchmarks
  comparisons: {
    overall: {
      level: String, // 'higher', 'similar', 'lower'
      difference: Number
    },
    skills: {
      level: String,
      difference: Number
    },
    experience: {
      level: String,
      difference: Number
    },
    knowledge: {
      level: String,
      difference: Number
    },
    community: {
      level: String,
      difference: Number
    }
  },
  
  // Generated feedback
  feedback: {
    summary: String,
    strengths: [String],
    improvements: [String],
    recommendations: [String]
  },
  
  // Assessment metadata
  completedAt: {
    type: Date,
    default: Date.now
  },
  
  // For research consent
  consentToResearch: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

module.exports = AssessmentResult;
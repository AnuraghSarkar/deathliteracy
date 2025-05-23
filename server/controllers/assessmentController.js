const AssessmentResult = require('../models/assessmentModel');

// @desc    Save assessment results
// @route   POST /api/assessments
// @access  Public (can be anonymous)
const saveAssessmentResult = async (req, res) => {
  try {
    const {
      demographics,
      answers,
      scores,
      comparisons,
      feedback,
      consentToResearch
    } = req.body;

    // Create assessment result
    const assessmentResult = await AssessmentResult.create({
      userId: req.user ? req.user._id : null, // Optional user ID if logged in
      demographics,
      answers,
      scores,
      comparisons,
      feedback,
      consentToResearch: consentToResearch || false
    });

    res.status(201).json({
      success: true,
      message: 'Assessment results saved successfully',
      assessmentId: assessmentResult._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving assessment results',
      error: error.message
    });
  }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/user
// @access  Private
const getUserAssessments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const assessments = await AssessmentResult.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .select('-answers'); // Don't return full answers for privacy

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment history',
      error: error.message
    });
  }
};

// @desc    Get single assessment result
// @route   GET /api/assessments/:id
// @access  Private (own assessments only)
const getAssessmentById = async (req, res) => {
  try {
    const assessment = await AssessmentResult.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user owns this assessment (if logged in)
    if (req.user && assessment.userId && assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assessment'
      });
    }

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment',
      error: error.message
    });
  }
};

// @desc    Get assessment statistics (admin only)
// @route   GET /api/assessments/stats
// @access  Private/Admin
const getAssessmentStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const totalAssessments = await AssessmentResult.countDocuments();
    const consentedAssessments = await AssessmentResult.countDocuments({ consentToResearch: true });
    
    // Calculate average scores
    const avgScores = await AssessmentResult.aggregate([
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$scores.overall' },
          avgSkills: { $avg: '$scores.skills' },
          avgExperience: { $avg: '$scores.experience' },
          avgKnowledge: { $avg: '$scores.knowledge' },
          avgCommunity: { $avg: '$scores.community' },
          avgSocialConnection: { $avg: '$scores.socialConnection' }
        }
      }
    ]);

    // Get demographic breakdown
    const demographicBreakdown = await AssessmentResult.aggregate([
      {
        $group: {
          _id: '$demographics.age',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalAssessments,
        consentedAssessments,
        averageScores: avgScores[0] || {},
        demographicBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment statistics',
      error: error.message
    });
  }
};

// @desc    Delete assessment (user's own only)
// @route   DELETE /api/assessments/:id
// @access  Private
const deleteAssessment = async (req, res) => {
  try {
    const assessment = await AssessmentResult.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user owns this assessment
    if (assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assessment'
      });
    }

    await assessment.deleteOne();

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting assessment',
      error: error.message
    });
  }
};

module.exports = {
  saveAssessmentResult,
  getUserAssessments,
  getAssessmentById,
  getAssessmentStats,
  deleteAssessment
};
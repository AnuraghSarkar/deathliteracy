// routes/adminAssessmentRoutes.js
const express = require('express');
const router = express.Router();
const AssessmentResult = require('../models/assessmentModel'); // Your existing model
const User = require('../models/userModel');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { 
  calculateDLIScores, 
  compareWithDLIBenchmarks, 
  generateDLIFeedback,
  calculateSocialConnection 
} = require('../utils/scoringSystem');

/**
 * @route   GET /api/admin/assessments
 * @desc    Get all assessment results for admin view with recalculated scores
 * @access  Private (Admin only)
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    // Get all assessment results with user details populated
    const assessments = await AssessmentResult.find({})
      .populate('userId', 'username email role hasCompletedOnboarding')
      .sort({ completedAt: -1 })
      .select('-__v');

    // Transform data for frontend using YOUR scoring logic
    const transformedAssessments = assessments.map(assessment => {
      // Convert Map answers to object for calculations
      const answersObj = assessment.answers ? Object.fromEntries(assessment.answers) : {};
      
      // Use YOUR calculation functions
      const userScores = calculateDLIScores(answersObj);
      const comparisons = compareWithDLIBenchmarks(userScores);
      const socialConnection = calculateSocialConnection(answersObj);
      const feedback = generateDLIFeedback(comparisons, assessment.demographics);

      return {
        _id: assessment._id,
        userId: assessment.userId ? {
          _id: assessment.userId._id,
          username: assessment.userId.username,
          email: assessment.userId.email,
          role: assessment.userId.role
        } : {
          _id: 'anonymous',
          username: 'Anonymous User',
          email: 'N/A'
        },
        status: 'completed',
        startedAt: assessment.createdAt,
        completedAt: assessment.completedAt,
        totalQuestions: assessment.answers ? assessment.answers.size : 0,
        answeredQuestions: assessment.answers ? assessment.answers.size : 0,
        totalScore: Math.round(userScores.overall * 10) / 10, // Scale to match your system
        maxPossibleScore: 10,
        categoryScores: {
          'Practical Knowledge': Math.round(userScores.domains.practicalKnowledge * 10) / 10,
          'Experiential Knowledge': Math.round(userScores.domains.experientialKnowledge * 10) / 10,
          'Factual Knowledge': Math.round(userScores.domains.factualKnowledge * 10) / 10,
          'Community Knowledge': Math.round(userScores.domains.communityKnowledge * 10) / 10,
          'Social Connection': Math.round(socialConnection.score * 10) / 10
        },
        durationMinutes: calculateAssessmentDuration(assessment.createdAt, assessment.completedAt),
        answers: answersObj,
        demographics: assessment.demographics || {},
        feedback: feedback,
        comparisons: comparisons,
        socialConnection: socialConnection,
        consentToResearch: assessment.consentToResearch || false,
        
        // Store the calculated scores for consistency
        calculatedScores: userScores,
        originalScores: assessment.scores // Keep original for comparison
      };
    });

    return res.json({
      success: true,
      assessments: transformedAssessments,
      count: transformedAssessments.length
    });

  } catch (err) {
    console.error('Admin get assessments error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching assessments'
    });
  }
});

/**
 * @route   GET /api/admin/assessments/:id
 * @desc    Get single assessment with detailed results using YOUR calculations
 * @access  Private (Admin only)
 */
router.get('/:id', protect, isAdmin, async (req, res) => {
  try {
    const assessment = await AssessmentResult.findById(req.params.id)
      .populate('userId', 'username email role demographics')
      .select('-__v');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Convert answers and recalculate using YOUR logic
    const answersObj = assessment.answers ? Object.fromEntries(assessment.answers) : {};
    const userScores = calculateDLIScores(answersObj);
    const comparisons = compareWithDLIBenchmarks(userScores);
    const socialConnection = calculateSocialConnection(answersObj);
    const feedback = generateDLIFeedback(comparisons, assessment.demographics);

    // Transform for detailed view with full calculation results
    const detailedAssessment = {
      _id: assessment._id,
      userId: assessment.userId || { username: 'Anonymous', email: 'N/A' },
      status: 'completed',
      completedAt: assessment.completedAt,
      createdAt: assessment.createdAt,
      demographics: assessment.demographics,
      
      // Use YOUR calculated scores
      scores: {
        overall: userScores.overall,
        skills: userScores.domains.practicalKnowledge,
        experience: userScores.domains.experientialKnowledge,
        knowledge: userScores.domains.factualKnowledge,
        community: userScores.domains.communityKnowledge,
        socialConnection: socialConnection.score
      },
      
      // Include comparison data
      comparisons: comparisons,
      socialConnection: socialConnection,
      feedback: feedback,
      
      answers: answersObj,
      answersArray: Object.entries(answersObj).map(([questionId, answer]) => ({
        questionId,
        answer
      })),
      
      consentToResearch: assessment.consentToResearch,
      totalQuestions: assessment.answers ? assessment.answers.size : 0,
      totalScore: userScores.overall,
      
      // Store both for comparison
      originalStoredScores: assessment.scores,
      recalculatedScores: userScores
    };

    return res.json({
      success: true,
      assessment: detailedAssessment
    });

  } catch (err) {
    console.error('Admin get assessment error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching assessment'
    });
  }
});

/**
 * @route   GET /api/admin/assessments/:id/report
 * @desc    Generate the same report format as your ResultsPage
 * @access  Private (Admin only)
 */
router.get('/:id/report', protect, isAdmin, async (req, res) => {
  try {
    const assessment = await AssessmentResult.findById(req.params.id)
      .populate('userId', 'username email role')
      .select('-__v');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Use YOUR exact calculation logic
    const answersObj = assessment.answers ? Object.fromEntries(assessment.answers) : {};
    const userScores = calculateDLIScores(answersObj);
    const comparisons = compareWithDLIBenchmarks(userScores);
    const socialConnection = calculateSocialConnection(answersObj);
    const feedback = generateDLIFeedback(comparisons, assessment.demographics);

    // Return the EXACT same format as your ResultsPage
    const reportData = {
      userScores,
      comparisons,
      socialConnection,
      feedback,
      answers: answersObj,
      demographics: assessment.demographics,
      userId: assessment.userId,
      completedAt: assessment.completedAt,
      assessmentId: assessment._id
    };

    return res.json({
      success: true,
      report: reportData
    });

  } catch (err) {
    console.error('Generate report error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
});

/**
 * @route   GET /api/admin/assessments/stats/overview
 * @desc    Get assessment statistics overview
 * @access  Private (Admin only)
 */
router.get('/stats/overview', protect, isAdmin, async (req, res) => {
  try {
    const totalAssessments = await AssessmentResult.countDocuments();
    const completedAssessments = totalAssessments; // All are completed in your model
    
    // Count unique users (including anonymous)
    const uniqueRegisteredUsers = await AssessmentResult.distinct('userId').length;
    const anonymousAssessments = await AssessmentResult.countDocuments({ userId: null });
    const uniqueUsers = uniqueRegisteredUsers + anonymousAssessments;
    
    // Calculate average scores
    const assessmentsWithScores = await AssessmentResult.find({ 
      'scores.overall': { $exists: true, $ne: null }
    });
    
    const avgScore = assessmentsWithScores.length > 0 ? 
      assessmentsWithScores.reduce((sum, a) => sum + (a.scores.overall || 0), 0) / assessmentsWithScores.length : 0;
    
    // Calculate average duration
    const assessmentsWithDuration = await AssessmentResult.find({
      createdAt: { $exists: true },
      completedAt: { $exists: true }
    });
    
    const avgDuration = assessmentsWithDuration.length > 0 ?
      assessmentsWithDuration.reduce((sum, a) => {
        const duration = calculateAssessmentDuration(a.createdAt, a.completedAt);
        return sum + (duration || 0);
      }, 0) / assessmentsWithDuration.length : 0;
    
    return res.json({
      success: true,
      stats: {
        totalAssessments,
        completedAssessments,
        uniqueUsers,
        avgScore: Math.round(avgScore),
        completionRate: 100, // All are completed
        avgDuration: Math.round(avgDuration)
      }
    });

  } catch (err) {
    console.error('Admin assessment stats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching assessment statistics'
    });
  }
});

/**
 * @route   DELETE /api/admin/assessments/:id
 * @desc    Delete an assessment result
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const assessment = await AssessmentResult.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await AssessmentResult.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });

  } catch (err) {
    console.error('Admin delete assessment error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting assessment'
    });
  }
});

/**
 * @route   GET /api/admin/assessments/export/csv
 * @desc    Export all assessment results as CSV
 * @access  Private (Admin only)
 */
router.get('/export/csv', protect, isAdmin, async (req, res) => {
  try {
    const assessments = await AssessmentResult.find({})
      .populate('userId', 'username email role')
      .sort({ completedAt: -1 });

    // Generate CSV headers
    const headers = [
      'Assessment ID',
      'User ID', 
      'Username', 
      'Email', 
      'Status', 
      'Completed Date',
      'Total Questions', 
      'Overall Score',
      'Skills Score',
      'Experience Score', 
      'Knowledge Score', 
      'Community Score',
      'Social Connection Score',
      'Age',
      'Gender',
      'Location',
      'Country',
      'State',
      'Terminal Illness',
      'Consent to Research'
    ];

    // Generate CSV rows
    const rows = assessments.map(a => [
      a._id,
      a.userId?._id || 'anonymous',
      a.userId?.username || 'Anonymous',
      a.userId?.email || 'N/A',
      'completed',
      a.completedAt ? new Date(a.completedAt).toISOString() : '',
      a.answers ? a.answers.size : 0,
      a.scores?.overall || '',
      a.scores?.skills || '',
      a.scores?.experience || '',
      a.scores?.knowledge || '',
      a.scores?.community || '',
      a.scores?.socialConnection || '',
      a.demographics?.age || '',
      a.demographics?.gender || '',
      a.demographics?.location || '',
      a.demographics?.country || '',
      a.demographics?.state || '',
      a.demographics?.terminalIllness || '',
      a.consentToResearch ? 'Yes' : 'No'
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=assessment_results_${new Date().toISOString().split('T')[0]}.csv`);
    
    return res.send(csvContent);

  } catch (err) {
    console.error('Admin export assessments error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting assessments'
    });
  }
});

// Helper function with unique name to avoid conflicts
const calculateAssessmentDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const diffMs = new Date(endTime) - new Date(startTime);
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
};

module.exports = router;
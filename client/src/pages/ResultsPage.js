import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  calculateOverallScore, 
  compareWithBenchmarks, 
  generateFeedback,
  calculateSocialConnectionScore 
} from '../utils/scoringSystem';
import '../styles/ResultsPage.css';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get answers from navigation state
    const answers = location.state?.answers;
    const demographics = location.state?.demographics;
    
    if (!answers) {
      navigate('/assessment');
      return;
    }

    // Calculate scores
    const userScores = calculateOverallScore(answers);
    const comparisons = compareWithBenchmarks(userScores);
    const socialConnection = calculateSocialConnectionScore(answers);
    const feedback = generateFeedback(comparisons, demographics, answers);

    const resultsData = {
      userScores,
      comparisons,
      socialConnection,
      feedback,
      answers,
      demographics
    };

    setResults(resultsData);
    
    // Save assessment results to backend
    saveAssessmentResults(resultsData);
    
    setLoading(false);
  }, [location.state, navigate]);

  const saveAssessmentResults = async (resultsData) => {
    try {
      const assessmentData = {
        demographics: resultsData.demographics,
        answers: resultsData.answers,
        scores: {
          overall: resultsData.userScores.overall,
          skills: resultsData.userScores.categories.skills,
          experience: resultsData.userScores.categories.experience,
          knowledge: resultsData.userScores.categories.knowledge,
          community: resultsData.userScores.categories.community,
          socialConnection: resultsData.socialConnection.score
        },
        comparisons: resultsData.comparisons,
        feedback: resultsData.feedback,
        consentToResearch: resultsData.demographics?.consentToResearch || false
      };

      // Get auth token if user is logged in
      const userInfo = localStorage.getItem('userInfo');
      const config = userInfo ? {
        headers: {
          Authorization: `Bearer ${JSON.parse(userInfo).token}`
        }
      } : {};

      const response = await axios.post('/api/assessments', assessmentData, config);
      
      if (response.data.success) {
        console.log('Assessment results saved successfully');
        // Store assessment ID for future reference
        localStorage.setItem('lastAssessmentId', response.data.assessmentId);
      }
    } catch (error) {
      console.error('Error saving assessment results:', error);
      // Don't show error to user - saving is optional
    }
  };

  const downloadReport = () => {
    // Create a simple text report
    const reportContent = `
DEATH LITERACY ASSESSMENT RESULTS
Generated: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${results.userScores.overall.toFixed(1)}/10
National Average: ${results.comparisons.overall.benchmark}/10

CATEGORY BREAKDOWN:
- Skills: ${results.userScores.categories.skills.toFixed(1)}/10 (National avg: ${results.comparisons.skills.benchmark}/10)
- Experience: ${results.userScores.categories.experience.toFixed(1)}/10 (National avg: ${results.comparisons.experience.benchmark}/10)
- Knowledge: ${results.userScores.categories.knowledge.toFixed(1)}/10 (National avg: ${results.comparisons.knowledge.benchmark}/10)
- Community: ${results.userScores.categories.community.toFixed(1)}/10 (National avg: ${results.comparisons.community.benchmark}/10)

SUMMARY:
${results.feedback.summary}

STRENGTHS:
${results.feedback.strengths.map(s => `- ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${results.feedback.improvements.map(i => `- ${i}`).join('\n')}

RECOMMENDATIONS:
${results.feedback.recommendations.map(r => `- ${r}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'death-literacy-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading">
          <h2>Calculating your results...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-container">
        <div className="error">
          <h2>Unable to load results</h2>
          <button className="btn-primary" onClick={() => navigate('/assessment')}>
            Take Assessment Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Your Death Literacy Assessment Results</h1>
        <p className="results-date">Completed on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Overall Score Section */}
      <div className="score-overview">
        <div className="overall-score">
          <h2>Overall Death Literacy Score</h2>
          <div className="score-circle">
            <span className="score-number">{results.userScores.overall.toFixed(1)}</span>
            <span className="score-max">/10</span>
          </div>
          <div className="benchmark-comparison">
            <p>Australian National Average: {results.comparisons.overall.benchmark}/10</p>
            <div className={`comparison-badge ${results.comparisons.overall.level}`}>
              {results.comparisons.overall.level === 'higher' && '↗ Above Average'}
              {results.comparisons.overall.level === 'similar' && '→ Similar to Average'}
              {results.comparisons.overall.level === 'lower' && '↘ Below Average'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="category-scores">
        <h2>Category Breakdown</h2>
        <div className="categories-grid">
          {Object.entries(results.userScores.categories).map(([category, score]) => (
            <div key={category} className="category-card">
              <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <div className="category-score">
                <span className="score">{score.toFixed(1)}/10</span>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ width: `${(score / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="benchmark">
                  Avg: {results.comparisons[category].benchmark}/10
                </span>
              </div>
              <div className={`level-indicator ${results.comparisons[category].level}`}>
                {results.comparisons[category].level === 'higher' && 'Above Average'}
                {results.comparisons[category].level === 'similar' && 'Average'}
                {results.comparisons[category].level === 'lower' && 'Below Average'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Connection Score */}
      <div className="social-connection">
        <h2>Social Connection Score</h2>
        <div className="social-score">
          <span className="score">{results.socialConnection.score.toFixed(1)}/4</span>
          <p>National Average: {results.socialConnection.benchmark}/4</p>
          <div className={`level-indicator ${results.socialConnection.level}`}>
            {results.socialConnection.level === 'higher' && 'Above Average'}
            {results.socialConnection.level === 'similar' && 'Average'}
            {results.socialConnection.level === 'lower' && 'Below Average'}
          </div>
          <p className="description">This measures your sense of community support and connection</p>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="feedback-section">
        <div className="feedback-summary">
          <h2>Your Personal Summary</h2>
          <p>{results.feedback.summary}</p>
        </div>

        {results.feedback.strengths.length > 0 && (
          <div className="strengths">
            <h3>Your Strengths</h3>
            <ul>
              {results.feedback.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {results.feedback.improvements.length > 0 && (
          <div className="improvements">
            <h3>Areas for Growth</h3>
            <ul>
              {results.feedback.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        {results.feedback.recommendations.length > 0 && (
          <div className="recommendations">
            <h3>Recommendations</h3>
            <ul>
              {results.feedback.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="btn-primary" onClick={downloadReport}>
          Download Report
        </button>
        <button className="btn-secondary" onClick={() => navigate('/assessment')}>
          Take Assessment Again
        </button>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>

      {/* Educational Links */}
      <div className="educational-resources">
        <h2>Learn More</h2>
        <div className="resource-links">
          <a href="https://www.deathliteracy.institute/" target="_blank" rel="noopener noreferrer">
            Death Literacy Institute
          </a>
          <a href="https://www.palliativecare.org.au/" target="_blank" rel="noopener noreferrer">
            Palliative Care Australia
          </a>
          <a href="https://www.advancecareplanning.org.au/" target="_blank" rel="noopener noreferrer">
            Advance Care Planning
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
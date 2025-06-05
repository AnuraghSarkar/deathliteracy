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

  const downloadPDFReport = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Death Literacy Assessment Report</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            margin: 40px;
            color: #333;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #CC2936; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 { 
            color: #CC2936; 
            margin-bottom: 10px;
            font-size: 2.5rem; 
          }
          .header p {
            color: #666;
            font-size: 1.1rem;
          }
          .score-section { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0;
            border: 1px solid #e9ecef; 
          }
          .overall-score { 
            text-align: center; 
            font-size: 4rem; 
            font-weight: bold; 
            color: #CC2936; 
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1); 
          }
          .benchmark-text {
            text-align: center;
            font-size: 1.1rem;
            margin: 10px 0;
            color: #666;
          }
          .comparison-badge {
            text-align: center;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 15px auto;
            display: inline-block;
          }
          .comparison-badge.higher {
            background: #d4edda;
            color: #155724;
          }
          .comparison-badge.similar {
            background: #fff3cd;
            color: #856404;
          }
          .comparison-badge.lower {
            background: #f8d7da;
            color: #721c24;
          }
          .category { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 5px solid #CC2936; 
            background: white; 
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .category h3 { 
            margin: 0 0 15px 0; 
            color: #CC2936;
            font-size: 1.3rem; 
          }
          .category-scores {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin: 10px 0;
          }
          .score-display {
            font-size: 1.5rem;
            font-weight: bold;
            color: #CC2936;
          }
          .score-bar { 
            width: 200px; 
            height: 25px; 
            background: #e9ecef; 
            border-radius: 12px; 
            overflow: hidden; 
            margin: 10px 0;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.2); 
          }
          .score-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #CC2936, #D84654); 
            border-radius: 12px;
            position: relative; 
          }
          .score-fill::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            right: 2px;
            height: 8px;
            background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent);
            border-radius: 10px;
          }
          .level-badge {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.9rem;
            font-weight: bold;
          }
          .level-badge.higher {
            background: #d4edda;
            color: #155724;
          }
          .level-badge.similar {
            background: #fff3cd;
            color: #856404;
          }
          .level-badge.lower {
            background: #f8d7da;
            color: #721c24;
          }
          .feedback-section { 
            margin: 30px 0;
            page-break-inside: avoid; 
          }
          .feedback-section h2 { 
            color: #CC2936; 
            border-bottom: 2px solid #CC2936; 
            padding-bottom: 10px;
            font-size: 1.8rem; 
          }
          .summary-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #CC2936;
            font-size: 1.1rem;
            line-height: 1.7;
          }
          ul { 
            padding-left: 25px;
            margin: 15px 0; 
          }
          li { 
            margin: 10px 0;
            line-height: 1.5; 
          }
          .strengths { 
            background: #d4edda; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 5px solid #28a745; 
          }
          .improvements { 
            background: #fff3cd; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 5px solid #ffc107; 
          }
          .recommendations { 
            background: #cce5ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 5px solid #007bff; 
          }
          .strengths h3 {
            color: #155724;
            margin-top: 0;
          }
          .improvements h3 {
            color: #856404;
            margin-top: 0;
          }
          .recommendations h3 {
            color: #004085;
            margin-top: 0;
          }
          .social-connection {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            border: 1px solid #b3d9ff;
          }
          .social-connection h2 {
            color: #0056b3;
            margin-top: 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 50px; 
            padding-top: 25px; 
            border-top: 2px solid #ddd; 
            color: #666; 
            font-size: 14px;
            page-break-inside: avoid; 
          }
          .footer p {
            margin: 8px 0;
          }
          @media print {
            body { margin: 20px; }
            .score-section, .category, .feedback-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Death Literacy Assessment Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-AU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="score-section">
          <h2>Overall Death Literacy Score</h2>
          <div class="overall-score">${results.userScores.overall.toFixed(1)}/10</div>
          <p class="benchmark-text">Australian National Average: ${results.comparisons.overall.benchmark}/10</p>
          <div class="comparison-badge ${results.comparisons.overall.level}">
            ${results.comparisons.overall.level === 'higher' ? '↗ Above Average' :
              results.comparisons.overall.level === 'similar' ? '→ Similar to Average' : '↘ Below Average'}
          </div>
        </div>

        <div class="score-section">
          <h2>Category Breakdown</h2>
          ${Object.entries(results.userScores.categories).map(([category, score]) => `
            <div class="category">
              <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <div class="category-scores">
                <div>
                  <div class="score-display">${score.toFixed(1)}/10</div>
                  <div style="font-size: 0.9rem; color: #666;">National Avg: ${results.comparisons[category].benchmark}/10</div>
                </div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${(score / 10) * 100}%"></div>
                </div>
                <div class="level-badge ${results.comparisons[category].level}">
                  ${results.comparisons[category].level === 'higher' ? 'Above Average' :
                    results.comparisons[category].level === 'similar' ? 'Average' : 'Below Average'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="social-connection">
          <h2>Social Connection Score</h2>
          <div class="category-scores">
            <div>
              <div class="score-display">${results.socialConnection.score.toFixed(1)}/4</div>
              <div style="font-size: 0.9rem; color: #666;">National Avg: ${results.socialConnection.benchmark}/4</div>
            </div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${(results.socialConnection.score / 4) * 100}%"></div>
            </div>
            <div class="level-badge ${results.socialConnection.level}">
              ${results.socialConnection.level === 'higher' ? 'Above Average' :
                results.socialConnection.level === 'similar' ? 'Average' : 'Below Average'}
            </div>
          </div>
          <p style="margin-top: 15px; font-style: italic;">This measures your sense of community support and connection in relation to end-of-life matters.</p>
        </div>

        <div class="feedback-section">
          <h2>Personal Summary</h2>
          <div class="summary-box">
            ${results.feedback.summary}
          </div>

          ${results.feedback.strengths.length > 0 ? `
            <div class="strengths">
              <h3>Your Strengths</h3>
              <ul>
                ${results.feedback.strengths.map(strength => `<li>${strength}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${results.feedback.improvements.length > 0 ? `
            <div class="improvements">
              <h3>Areas for Growth</h3>
              <ul>
                ${results.feedback.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${results.feedback.recommendations.length > 0 ? `
            <div class="recommendations">
              <h3>Recommendations</h3>
              <ul>
                ${results.feedback.recommendations.map(recommendation => `<li>${recommendation}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p><strong>This report was generated by the Death Literacy Assessment Tool</strong></p>
          <p>For more information and resources, visit: <strong>www.deathliteracy.institute</strong></p>
          <p>Assessment completed: ${new Date().toLocaleDateString('en-AU')} at ${new Date().toLocaleTimeString('en-AU')}</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `death-literacy-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show instructions to user
    setTimeout(() => {
      alert('Professional report downloaded! \n\nTo create a PDF:\n1. Open the HTML file in your browser\n2. Press Ctrl+P (or Cmd+P on Mac)\n3. Choose "Save as PDF"\n4. Click Save');
    }, 500);
  };

  const downloadDetailedReport = () => {
    const reportContent = `
DEATH LITERACY ASSESSMENT - DETAILED REPORT
================================================
Generated: ${new Date().toLocaleDateString('en-AU', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

EXECUTIVE SUMMARY
================================================
Overall Death Literacy Score: ${results.userScores.overall.toFixed(1)}/10
National Benchmark: ${results.comparisons.overall.benchmark}/10
Performance Level: ${results.comparisons.overall.level.toUpperCase()}

${results.feedback.summary}

DETAILED CATEGORY ANALYSIS
================================================

${Object.entries(results.userScores.categories).map(([category, score]) => `
${category.toUpperCase()} CATEGORY
Your Score: ${score.toFixed(1)}/10
National Average: ${results.comparisons[category].benchmark}/10
Performance: ${results.comparisons[category].level.toUpperCase()}
Progress Bar: ${'█'.repeat(Math.round(score))}${'░'.repeat(10 - Math.round(score))} (${((score/10)*100).toFixed(0)}%)
`).join('')}

SOCIAL CONNECTION ASSESSMENT
================================================
Your Score: ${results.socialConnection.score.toFixed(1)}/4
National Average: ${results.socialConnection.benchmark}/4
Level: ${results.socialConnection.level.toUpperCase()}
Progress Bar: ${'█'.repeat(Math.round(results.socialConnection.score))}${'░'.repeat(4 - Math.round(results.socialConnection.score))} (${((results.socialConnection.score/4)*100).toFixed(0)}%)

This measures your sense of community support and connection in relation to end-of-life matters.

PERSONAL DEVELOPMENT INSIGHTS
================================================

${results.feedback.strengths.length > 0 ? `
STRENGTHS IDENTIFIED:
${results.feedback.strengths.map((strength, i) => `${i + 1}. ${strength}`).join('\n')}
` : ''}

${results.feedback.improvements.length > 0 ? `
AREAS FOR GROWTH:
${results.feedback.improvements.map((improvement, i) => `${i + 1}. ${improvement}`).join('\n')}
` : ''}

${results.feedback.recommendations.length > 0 ? `
PERSONALIZED RECOMMENDATIONS:
${results.feedback.recommendations.map((recommendation, i) => `${i + 1}. ${recommendation}`).join('\n')}
` : ''}

DEMOGRAPHIC INFORMATION
================================================
Country: ${results.demographics?.country || 'Not specified'}
State/Territory: ${results.demographics?.state || 'Not specified'}
Age Group: ${results.demographics?.age || 'Not specified'}
Gender: ${results.demographics?.gender || 'Not specified'}
Terminal Illness Status: ${results.demographics?.terminalIllness || 'Not specified'}

EDUCATIONAL RESOURCES
================================================
To continue your death literacy journey, consider exploring:

• Death Literacy Institute: https://www.deathliteracy.institute/
• Palliative Care Australia: https://www.palliativecare.org.au/
• Advance Care Planning: https://www.advancecareplanning.org.au/
• Grief and Bereavement Support: https://www.grief.org.au/

ABOUT THIS ASSESSMENT
================================================
This assessment measures death literacy across multiple domains including 
practical skills, experiential knowledge, factual knowledge, and community 
connections. Scores are compared against Australian national benchmarks.

The assessment is based on research in thanatology and death studies, 
providing evidence-based insights into your preparedness for end-of-life 
matters both personally and in supporting others.

Report Generated by: Death Literacy Assessment Tool
Assessment ID: ${localStorage.getItem('lastAssessmentId') || 'N/A'}
Version: 2.0
================================================
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `death-literacy-detailed-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSVData = () => {
    // Create CSV with all the data
    const csvContent = [
      ['Category', 'Your Score', 'National Average', 'Comparison'],
      ['Overall', results.userScores.overall.toFixed(1), results.comparisons.overall.benchmark, results.comparisons.overall.level],
      ...Object.entries(results.userScores.categories).map(([category, score]) => [
        category.charAt(0).toUpperCase() + category.slice(1),
        score.toFixed(1),
        results.comparisons[category].benchmark,
        results.comparisons[category].level
      ]),
      ['Social Connection', results.socialConnection.score.toFixed(1), results.socialConnection.benchmark, results.socialConnection.level],
      [],
      ['Demographics'],
      ['Country', results.demographics?.country || 'Not specified'],
      ['State', results.demographics?.state || 'Not specified'],
      ['Age Group', results.demographics?.age || 'Not specified'],
      ['Gender', results.demographics?.gender || 'Not specified'],
      [],
      ['Assessment Date', new Date().toLocaleDateString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `death-literacy-data-${new Date().toISOString().split('T')[0]}.csv`;
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
          <div 
            className="score-circle"
            style={{'--progress': (results.userScores.overall / 10) * 100}}
          >
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

      {/* Enhanced Action Buttons */}
      <div className="results-actions">
        <div className="download-options">
          <h3>Download Your Results</h3>
          <div className="download-buttons">
            <button className="btn-primary download-btn" onClick={downloadPDFReport}>
              <div className="btn-icon">📄</div>
              <div className="btn-content">
                <div className="btn-title">Professional Report (HTML/PDF)</div>
                <div className="btn-description">Beautifully formatted report ready for printing or sharing</div>
              </div>
            </button>
            <button className="btn-secondary download-btn" onClick={downloadDetailedReport}>
              <div className="btn-icon">📋</div>
              <div className="btn-content">
                <div className="btn-title">Detailed Analysis (Text)</div>
                <div className="btn-description">Comprehensive text report with detailed insights and recommendations</div>
              </div>
            </button>
            <button className="btn-secondary download-btn" onClick={downloadCSVData}>
              <div className="btn-icon">📊</div>
              <div className="btn-content">
                <div className="btn-title">Data Export (CSV)</div>
                <div className="btn-description">Raw data export for spreadsheet analysis and record keeping</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="navigation-actions">
          <button className="btn-secondary" onClick={() => navigate('/assessment')}>
            Take Assessment Again
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
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
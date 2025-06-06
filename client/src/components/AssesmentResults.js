import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Select,
  DatePicker,
  Tag,
  Space,
  Progress,
  message,
  Tooltip,
  Divider,
  Modal,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AssessmentResults = () => {
  const { user } = useAuthContext();
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    uniqueUsers: 0,
    avgScore: 0,
    completionRate: 0,
    avgDuration: 0,
  });

  // Filters
  const [userFilter, setUserFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const getAuthToken = () => {
    return user?.token || localStorage.getItem('adminToken');
  };

  // Fetch assessment results
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get('/api/admin/assessments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const assessmentData = response.data.assessments || [];
        setAssessments(assessmentData);
        setFilteredAssessments(assessmentData);
        calculateStats(assessmentData);
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);

      // Fallback to mock data for development/testing - keeping your original structure
      const mockAssessments = generateMockAssessments();
      setAssessments(mockAssessments);
      setFilteredAssessments(mockAssessments);
      calculateStats(mockAssessments);

      message.warning('Using mock data – assessment API not available yet');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for testing - YOUR ORIGINAL STRUCTURE
  const generateMockAssessments = () => {
    const users = ['anuragh', 'reaast1234'];
    return Array.from({ length: 12 }, (_, i) => ({
      _id: `assessment_${i + 1}`,
      userId:
        i % 3 === 0
          ? {
              _id: 'anonymous',
              username: 'Anonymous User',
              email: 'N/A',
            }
          : {
              _id: `user_${(i % 2) + 1}`,
              username: users[i % 2],
              email: i % 2 === 0 ? 'admin@admin.com' : 'aaa@gmail.com',
            },
      status: 'completed',
      startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - Math.random() * 29 * 24 * 60 * 60 * 1000),
      totalQuestions: Math.floor(Math.random() * 20) + 50,
      answeredQuestions: Math.floor(Math.random() * 20) + 50,
      totalScore: Math.floor(Math.random() * 100) + 200,
      maxPossibleScore: 500,
      categoryScores: {
        'Practical Knowledge': Math.floor(Math.random() * 80) + 40,
        'Experiential Knowledge': Math.floor(Math.random() * 70) + 30,
        'Factual Knowledge': Math.floor(Math.random() * 90) + 50,
        'Community Knowledge': Math.floor(Math.random() * 85) + 60,
        'Social Connection': Math.floor(Math.random() * 75) + 45,
      },
      durationMinutes: Math.floor(Math.random() * 45) + 15,
      answers: generateMockAnswers(Math.floor(Math.random() * 20) + 50),
      demographics: {
        age: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)],
        gender: Math.random() > 0.5 ? 'female' : 'male',
        location: Math.random() > 0.5 ? 'Urban' : 'Rural',
        country: ['Australia', 'Canada', 'UK', 'USA'][Math.floor(Math.random() * 4)],
        state: ['Victoria', 'NSW', 'Queensland'][Math.floor(Math.random() * 3)],
        terminalIllness: Math.random() > 0.7 ? 'Yes' : 'No',
      },
      feedback: {
        summary: 'Your death literacy assessment shows...',
        strengths: ['Good understanding of end-of-life planning', 'Strong social connections'],
        improvements: ['Consider learning more about grief support'],
        recommendations: ['Attend a death cafe', 'Read about advance directives'],
      },
      comparisons: {
        overall: {
          level: ['higher', 'similar', 'lower'][Math.floor(Math.random() * 3)],
          difference: Math.floor(Math.random() * 20) - 10,
        },
      },
      consentToResearch: Math.random() > 0.5,
    }));
  };

  const generateMockAnswers = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      questionId: `Q${i + 1}`,
      answer: Math.floor(Math.random() * 5) + 1,
      timeSpent: Math.floor(Math.random() * 30) + 5,
      category: 'General',
    }));
  };

  const calculateStats = (data) => {
    const completed = data.filter((a) => a.status === 'completed');
    const totalUsers = new Set(data.map((a) => a.userId._id)).size;
    const avgScore =
      completed.length > 0
        ? completed.reduce((sum, a) => sum + (a.totalScore || 0), 0) / completed.length
        : 0;
    const avgDuration =
      completed.length > 0
        ? completed.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / completed.length
        : 0;

    setStats({
      totalAssessments: data.length,
      uniqueUsers: totalUsers,
      avgScore: Math.round(avgScore),
      completionRate: data.length > 0 ? Math.round((completed.length / data.length) * 100) : 0,
      avgDuration: Math.round(avgDuration),
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...assessments];

    if (userFilter !== 'all') {
      filtered = filtered.filter((a) => a.userId.username === userFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter((a) => {
        const assessmentDate = new Date(a.startedAt);
        return assessmentDate >= start && assessmentDate <= end;
      });
    }

    setFilteredAssessments(filtered);
    calculateStats(filtered);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [userFilter, statusFilter, dateRange, assessments]);

  // Professional PDF Report - FIXED to work with your data structure
  const downloadProfessionalPDFReport = (assessment) => {
    // Calculate percentage score
    const overallPercentage = assessment.totalScore && assessment.maxPossibleScore ? 
      Math.round((assessment.totalScore / assessment.maxPossibleScore) * 100) : 0;
    
    // Convert raw scores to 0-10 scale for display
    const overallScoreOutOf10 = assessment.totalScore && assessment.maxPossibleScore ? 
      ((assessment.totalScore / assessment.maxPossibleScore) * 10).toFixed(1) : 'N/A';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Death Literacy Assessment Report - ${assessment.userId?.username || 'Anonymous'}</title>
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
          .score-display {
            font-size: 1.5rem;
            font-weight: bold;
            color: #CC2936;
          }
          .participant-info {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            border: 1px solid #b3d9ff;
          }
          .participant-info h2 {
            color: #0056b3;
            margin-top: 0;
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
          .strengths h3 { color: #155724; margin-top: 0; }
          .improvements h3 { color: #856404; margin-top: 0; }
          .recommendations h3 { color: #004085; margin-top: 0; }
          .footer { 
            text-align: center; 
            margin-top: 50px; 
            padding-top: 25px; 
            border-top: 2px solid #ddd; 
            color: #666; 
            font-size: 14px;
            page-break-inside: avoid; 
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
          }
          .category-grid {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin: 10px 0;
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
          <p>Participant: ${assessment.userId?.username || 'Anonymous User'}</p>
          <p>Generated on ${new Date().toLocaleDateString('en-AU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="participant-info">
          <h2>Participant Information</h2>
          <p><strong>Username:</strong> ${assessment.userId?.username || 'Anonymous'}</p>
          <p><strong>Email:</strong> ${assessment.userId?.email || 'Not provided'}</p>
          <p><strong>Assessment Date:</strong> ${new Date(assessment.startedAt).toLocaleDateString()}</p>
          <p><strong>Completed:</strong> ${assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'In Progress'}</p>
          <p><strong>Duration:</strong> ${assessment.durationMinutes || 'N/A'} minutes</p>
          <p><strong>Progress:</strong> ${assessment.answeredQuestions}/${assessment.totalQuestions} questions (${Math.round((assessment.answeredQuestions / assessment.totalQuestions) * 100)}%)</p>
          ${assessment.demographics ? `
          <h3>Demographics</h3>
          <p><strong>Country:</strong> ${assessment.demographics.country || 'Not specified'}</p>
          <p><strong>State:</strong> ${assessment.demographics.state || 'Not specified'}</p>
          <p><strong>Age:</strong> ${assessment.demographics.age || 'Not specified'}</p>
          <p><strong>Gender:</strong> ${assessment.demographics.gender || 'Not specified'}</p>
          <p><strong>Location:</strong> ${assessment.demographics.location || 'Not specified'}</p>
          <p><strong>Terminal Illness:</strong> ${assessment.demographics.terminalIllness || 'Not specified'}</p>
          ` : ''}
        </div>

        <div class="score-section">
          <h2>Overall Assessment Score</h2>
          <div class="overall-score">${assessment.totalScore}/${assessment.maxPossibleScore}</div>
          <div class="overall-score" style="font-size: 2rem; margin: 10px 0;">${overallScoreOutOf10}/10 (${overallPercentage}%)</div>
          ${assessment.comparisons?.overall ? `
          <div class="comparison-badge ${assessment.comparisons.overall.level}">
            ${assessment.comparisons.overall.level === 'higher' ? '↗ Above Average' :
              assessment.comparisons.overall.level === 'similar' ? '→ Similar to Average' : '↘ Below Average'}
          </div>
          ` : ''}
        </div>

        <div class="score-section">
          <h2>Category Breakdown</h2>
          
          ${assessment.categoryScores ? Object.entries(assessment.categoryScores).map(([category, score]) => `
          <div class="category">
            <h3>${category}</h3>
            <div class="category-grid">
              <div class="score-display">${score}/100</div>
              <div class="score-bar">
                <div class="score-fill" style="width: ${score}%"></div>
              </div>
              <div style="padding: 4px 12px; border-radius: 15px; font-size: 0.9rem; font-weight: bold; background: ${
                score >= 70 ? '#d4edda; color: #155724' :
                score >= 50 ? '#fff3cd; color: #856404' : '#f8d7da; color: #721c24'
              };">
                ${score >= 70 ? 'Above Average' : score >= 50 ? 'Average' : 'Below Average'}
              </div>
            </div>
            <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
              Scaled Score: ${(score / 10).toFixed(1)}/10
            </p>
          </div>
          `).join('') : 'Category scores not available'}
        </div>

        ${assessment.feedback ? `
        <div class="feedback-section">
          <h2>Assessment Feedback</h2>
          ${assessment.feedback.summary ? `
          <div class="summary-box">
            ${assessment.feedback.summary}
          </div>
          ` : ''}

          ${assessment.feedback.strengths && assessment.feedback.strengths.length > 0 ? `
          <div class="strengths">
            <h3>Identified Strengths</h3>
            <ul>
              ${assessment.feedback.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${assessment.feedback.improvements && assessment.feedback.improvements.length > 0 ? `
          <div class="improvements">
            <h3>Areas for Improvement</h3>
            <ul>
              ${assessment.feedback.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${assessment.feedback.recommendations && assessment.feedback.recommendations.length > 0 ? `
          <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
              ${assessment.feedback.recommendations.map(recommendation => `<li>${recommendation}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <p><strong>This report was generated by the Death Literacy Assessment Tool - Admin Dashboard</strong></p>
          <p>Assessment ID: ${assessment._id}</p>
          <p>Research Consent: ${assessment.consentToResearch ? 'Yes' : 'No'}</p>
          <p>Generated: ${new Date().toLocaleDateString('en-AU')} at ${new Date().toLocaleTimeString('en-AU')}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `death-literacy-report-${assessment.userId?.username || 'anonymous'}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Professional report downloaded! Open the HTML file in your browser and use Ctrl+P (Cmd+P on Mac) to save as PDF.');
  };

  // Enhanced CSV Report - FIXED to work with your data structure
  const downloadCSVDataReport = (assessment) => {
    const csvHeaders = ['Field', 'Value'];
    const overallPercentage = assessment.totalScore && assessment.maxPossibleScore ? 
      Math.round((assessment.totalScore / assessment.maxPossibleScore) * 100) : 0;

    const csvData = [
      // Basic Information
      ['Assessment ID', assessment._id],
      ['Username', assessment.userId?.username || 'Anonymous'],
      ['Email', assessment.userId?.email || 'Not provided'],
      ['Started Date', new Date(assessment.startedAt).toLocaleDateString()],
      ['Completed Date', assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'In Progress'],
      ['Duration (minutes)', assessment.durationMinutes || 'N/A'],
      ['Research Consent', assessment.consentToResearch ? 'Yes' : 'No'],
      [''],
      
      // Scores
      ['Total Score', assessment.totalScore || 'N/A'],
      ['Max Possible Score', assessment.maxPossibleScore || 'N/A'],
      ['Percentage Score', `${overallPercentage}%`],
      ['Questions Answered', `${assessment.answeredQuestions}/${assessment.totalQuestions}`],
      [''],
      
      // Category Scores
      ...(assessment.categoryScores ? 
        Object.entries(assessment.categoryScores).map(([category, score]) => [category, `${score}/100`]) : 
        [['Category Scores', 'Not available']]
      ),
      [''],
      
      // Comparison
      ['Overall Comparison', assessment.comparisons?.overall?.level || 'N/A'],
      ['Comparison Difference', assessment.comparisons?.overall?.difference || 'N/A'],
      [''],
      
      // Demographics
      ['Country', assessment.demographics?.country || 'Not specified'],
      ['State', assessment.demographics?.state || 'Not specified'],
      ['Location Type', assessment.demographics?.location || 'Not specified'],
      ['Age Group', assessment.demographics?.age || 'Not specified'],
      ['Gender', assessment.demographics?.gender || 'Not specified'],
      ['Terminal Illness', assessment.demographics?.terminalIllness || 'Not specified'],
      [''],
      
      // Feedback Summary
      ['Feedback Summary', assessment.feedback?.summary || 'Not available'],
      [''],
      
      // Strengths
      ...(assessment.feedback?.strengths ? 
        assessment.feedback.strengths.map((strength, index) => [`Strength ${index + 1}`, strength]) : 
        [['Strengths', 'Not available']]
      ),
      [''],
      
      // Improvements
      ...(assessment.feedback?.improvements ? 
        assessment.feedback.improvements.map((improvement, index) => [`Improvement ${index + 1}`, improvement]) : 
        [['Improvements', 'Not available']]
      ),
      [''],
      
      // Recommendations
      ...(assessment.feedback?.recommendations ? 
        assessment.feedback.recommendations.map((recommendation, index) => [`Recommendation ${index + 1}`, recommendation]) : 
        [['Recommendations', 'Not available']]
      ),
      [''],
      
      // Individual Answers
      ['Individual Responses', ''],
      ...(assessment.answers ? 
        assessment.answers.map(answer => [answer.questionId, `Answer: ${answer.answer}, Time: ${answer.timeSpent}s`]) : 
        [['Individual Responses', 'Not available']]
      )
    ];

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `death-literacy-data-${assessment.userId?.username || 'anonymous'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('CSV data report downloaded successfully!');
  };

  // Main download function
  const downloadAssessmentReport = (assessment) => {
    const format = window.confirm(
      "Choose download format:\n\nOK = Professional PDF Report (HTML)\nCancel = CSV Data Export"
    );
    
    if (format) {
      downloadProfessionalPDFReport(assessment);
    } else {
      downloadCSVDataReport(assessment);
    }
  };

  // Export all results as CSV - FIXED for your data structure
  const exportAllResults = () => {
    const csvData = generateAllResultsCSV(filteredAssessments);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-assessment-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('All results exported successfully');
  };

  // Generate CSV for all results - YOUR DATA STRUCTURE
  const generateAllResultsCSV = (assessments) => {
    const headers = [
      'Assessment ID',
      'Username',
      'Email',
      'Started Date',
      'Completed Date',
      'Status',
      'Total Score',
      'Max Score',
      'Percentage',
      'Duration (min)',
      'Questions Progress',
      'Practical Knowledge',
      'Experiential Knowledge',
      'Factual Knowledge',
      'Community Knowledge',
      'Social Connection',
      'Overall Comparison',
      'Country',
      'State',
      'Age',
      'Gender',
      'Terminal Illness',
      'Research Consent'
    ];

    const rows = assessments.map(a => [
      a._id,
      a.userId?.username || 'Anonymous',
      a.userId?.email || 'Not provided',
      new Date(a.startedAt).toLocaleDateString(),
      a.completedAt ? new Date(a.completedAt).toLocaleDateString() : 'In Progress',
      a.status,
      a.totalScore || 'N/A',
      a.maxPossibleScore || 'N/A',
      a.totalScore && a.maxPossibleScore ? Math.round((a.totalScore / a.maxPossibleScore) * 100) + '%' : 'N/A',
      a.durationMinutes || 'N/A',
      `${a.answeredQuestions}/${a.totalQuestions}`,
      a.categoryScores?.['Practical Knowledge'] || 'N/A',
      a.categoryScores?.['Experiential Knowledge'] || 'N/A',
      a.categoryScores?.['Factual Knowledge'] || 'N/A',
      a.categoryScores?.['Community Knowledge'] || 'N/A',
      a.categoryScores?.['Social Connection'] || 'N/A',
      a.comparisons?.overall?.level || 'N/A',
      a.demographics?.country || 'Not specified',
      a.demographics?.state || 'Not specified',
      a.demographics?.age || 'Not specified',
      a.demographics?.gender || 'Not specified',
      a.demographics?.terminalIllness || 'Not specified',
      a.consentToResearch ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Table columns - UPDATED for your data structure
  const columns = [
    {
      title: 'User',
      dataIndex: ['userId', 'username'],
      key: 'user',
      render: (username, record) => (
        <div>
          <strong>{username}</strong>
          <br />
          <small style={{ color: '#666' }}>{record.userId.email}</small>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          completed: 'green',
          in_progress: 'orange',
          abandoned: 'red',
        };
        return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
      },
      filters: [{ text: 'Completed', value: 'completed' }],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const progress = Math.round(
          (record.answeredQuestions / record.totalQuestions) * 100
        );
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={progress}
              size="small"
              format={() => `${record.answeredQuestions}/${record.totalQuestions}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Score',
      key: 'score',
      render: (_, record) => {
        if (!record.totalScore) return '-';
        const percentage = Math.round(
          (record.totalScore / record.maxPossibleScore) * 100
        );
        return (
          <div>
            <strong>
              {record.totalScore}/{record.maxPossibleScore}
            </strong>
            <br />
            <Tag
              color={
                percentage >= 70 ? 'green' : percentage >= 50 ? 'orange' : 'red'
              }
            >
              {percentage}%
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => (a.totalScore || 0) - (b.totalScore || 0),
    },
    {
      title: 'Category Scores',
      key: 'categoryScores',
      render: (_, record) => {
        if (!record.categoryScores) return '-';
        return (
          <div style={{ fontSize: '12px' }}>
            {Object.entries(record.categoryScores).slice(0, 3).map(([category, score]) => (
              <div key={category}>
                {category.split(' ')[0]}: {score}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Comparison',
      key: 'comparison',
      render: (_, record) => {
        if (!record.comparisons?.overall) return '-';
        const level = record.comparisons.overall.level;
        const color = level === 'higher' ? 'green' : level === 'similar' ? 'orange' : 'red';
        return (
          <Tag color={color}>
            {level === 'higher' && '↗ Above Avg'}
            {level === 'similar' && '→ Average'}
            {level === 'lower' && '↘ Below Avg'}
          </Tag>
        );
      },
      filters: [
        { text: 'Above Average', value: 'higher' },
        { text: 'Average', value: 'similar' },
        { text: 'Below Average', value: 'lower' },
      ],
      onFilter: (value, record) => record.comparisons?.overall?.level === value,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      key: 'duration',
      render: (duration) => (duration ? `${duration} min` : '-'),
      sorter: (a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0),
    },
    {
      title: 'Date',
      dataIndex: 'startedAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startedAt) - new Date(b.startedAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Download Professional Report">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadProfessionalPDFReport(record)}
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="Download CSV Data">
            <Button
              type="default"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadCSVDataReport(record)}
            >
              CSV
            </Button>
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedAssessment(record);
                setDetailModalOpen(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Assessment Results</h2>
        <p style={{ color: '#666' }}>
          View and analyze user assessment results and performance
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Assessments"
              value={stats.totalAssessments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Unique Users"
              value={stats.uniqueUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="(+anon)"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Score"
              value={stats.avgScore}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by User"
              style={{ width: '100%' }}
              value={userFilter}
              onChange={setUserFilter}
            >
              <Option value="all">All Users</Option>
              {[...new Set(assessments.map((a) => a.userId.username))].map(
                (username) => (
                  <Option key={username} value={username}>
                    {username}
                  </Option>
                )
              )}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Statuses</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={24} md={4}>
            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportAllResults}
              >
                Export All
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Results Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAssessments}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} assessments`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal - UPDATED for your data structure */}
      <Modal
        title={`Assessment Details – ${
          selectedAssessment?.userId.username || ''
        }`}
        visible={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width={800}
        footer={[
          <Button
            key="download-pdf"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => downloadProfessionalPDFReport(selectedAssessment)}
          >
            Download PDF Report
          </Button>,
          <Button
            key="download-csv"
            icon={<DownloadOutlined />}
            onClick={() => downloadCSVDataReport(selectedAssessment)}
          >
            Download CSV
          </Button>,
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedAssessment && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Assessment Info">
                  <p>
                    <strong>Status:</strong> {selectedAssessment.status}
                  </p>
                  <p>
                    <strong>Started:</strong>{' '}
                    {new Date(
                      selectedAssessment.startedAt
                    ).toLocaleString()}
                  </p>
                  {selectedAssessment.completedAt && (
                    <p>
                      <strong>Completed:</strong>{' '}
                      {new Date(
                        selectedAssessment.completedAt
                      ).toLocaleString()}
                    </p>
                  )}
                  <p>
                    <strong>Duration:</strong>{' '}
                    {selectedAssessment.durationMinutes || 'N/A'} minutes
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Score Breakdown">
                  {selectedAssessment.totalScore && (
                    <>
                      <p>
                        <strong>Total Score:</strong>{' '}
                        {selectedAssessment.totalScore}/
                        {selectedAssessment.maxPossibleScore}
                      </p>
                      <p>
                        <strong>Percentage:</strong>{' '}
                        {Math.round(
                          (selectedAssessment.totalScore /
                            selectedAssessment.maxPossibleScore) *
                            100
                        )}
                        %
                      </p>
                    </>
                  )}
                  <p>
                    <strong>Progress:</strong>{' '}
                    {selectedAssessment.answeredQuestions}/
                    {selectedAssessment.totalQuestions} questions
                  </p>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card size="small" title="Category Score Breakdown">
              {selectedAssessment.categoryScores && (
                <div>
                  {Object.entries(
                    selectedAssessment.categoryScores
                  ).map(([category, score]) => (
                    <div key={category} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <span>{category}</span>
                        <span>{score}/100</span>
                      </div>
                      <Progress
                        percent={Math.round(score)}
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Divider />

            {/* Feedback Section */}
            {selectedAssessment.feedback && (
              <div>
                <Card
                  size="small"
                  title="Personal Summary"
                  style={{ marginBottom: 16 }}
                >
                  <p style={{ fontStyle: 'italic', color: '#666' }}>
                    {selectedAssessment.feedback.summary ||
                      'Feedback summary not available'}
                  </p>
                </Card>

                <Row gutter={[16, 16]}>
                  {selectedAssessment.feedback.strengths &&
                    selectedAssessment.feedback.strengths.length > 0 && (
                      <Col span={8}>
                        <Card
                          size="small"
                          title="Strengths"
                          headStyle={{ background: '#f6ffed' }}
                        >
                          <ul style={{ paddingLeft: 20, margin: 0 }}>
                            {selectedAssessment.feedback.strengths.map(
                              (strength, index) => (
                                <li
                                  key={index}
                                  style={{
                                    marginBottom: 8,
                                    color: '#52c41a',
                                  }}
                                >
                                  {strength}
                                </li>
                              )
                            )}
                          </ul>
                        </Card>
                      </Col>
                    )}

                  {selectedAssessment.feedback.improvements &&
                    selectedAssessment.feedback.improvements.length > 0 && (
                      <Col span={8}>
                        <Card
                          size="small"
                          title="Areas for Growth"
                          headStyle={{ background: '#fffbe6' }}
                        >
                          <ul style={{ paddingLeft: 20, margin: 0 }}>
                            {selectedAssessment.feedback.improvements.map(
                              (improvement, index) => (
                                <li
                                  key={index}
                                  style={{
                                    marginBottom: 8,
                                    color: '#faad14',
                                  }}
                                >
                                  {improvement}
                                </li>
                              )
                            )}
                          </ul>
                        </Card>
                      </Col>
                    )}

                  {selectedAssessment.feedback.recommendations &&
                    selectedAssessment.feedback.recommendations.length > 0 && (
                      <Col span={8}>
                        <Card
                          size="small"
                          title="Recommendations"
                          headStyle={{ background: '#e6f7ff' }}
                        >
                          <ul style={{ paddingLeft: 20, margin: 0 }}>
                            {selectedAssessment.feedback.recommendations.map(
                              (recommendation, index) => (
                                <li
                                  key={index}
                                  style={{
                                    marginBottom: 8,
                                    color: '#1890ff',
                                  }}
                                >
                                  {recommendation}
                                </li>
                              )
                            )}
                          </ul>
                        </Card>
                      </Col>
                    )}
                </Row>
              </div>
            )}

            <Divider />

            {/* Demographics Information */}
            {selectedAssessment.demographics && (
              <Card size="small" title="Demographics">
                <Row gutter={[16, 8]}>
                  {Object.entries(selectedAssessment.demographics).map(
                    ([key, value]) =>
                      value && (
                        <Col span={12} key={key}>
                          <strong>
                            {key
                              .charAt(0)
                              .toUpperCase()
                              .concat(
                                key
                                  .slice(1)
                                  .replace(/([A-Z])/g, ' $1')
                              )}
                            :
                          </strong>{' '}
                          {value}
                        </Col>
                      )
                  )}
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssessmentResults;
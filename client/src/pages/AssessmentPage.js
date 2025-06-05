import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import countryList from 'react-select-country-list';
import { Radio, Space } from 'antd';
import '../styles/AssessmentPage.css';

// List of Australian states/territories for Q1_1
const australiaStates = [
  'New South Wales',
  'Victoria',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Australian Capital Territory',
  'Northern Territory'
];

// Custom Dropdown Component (unchanged)
const CustomDropdown = ({ value, onChange, options, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-dropdown">
      <div 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="dropdown-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="dropdown-arrow">▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          <input
            type="text"
            className="dropdown-search"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="dropdown-options">
            {filteredOptions.slice(0, 10).map(option => (
              <div
                key={option.value}
                className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
            {filteredOptions.length > 10 && (
              <div className="dropdown-more">
                {filteredOptions.length - 10} more countries...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [demographics, setDemographics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Fetch questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/api/questions');
        if (response.data.success) {
          const fetchedQuestions = response.data.questions;
          const processedQuestions = processQuestionsFromDB(fetchedQuestions);
          setQuestions(processedQuestions);
        } else {
          setError('Failed to load questions');
        }
      } catch (error) {
        setError('Failed to load questions from database');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Process questions from database format to frontend format
  const processQuestionsFromDB = (dbQuestions) => {
    const processedQuestions = [];
    const questionGroups = {};

    // Sort questions by order
    const sortedQuestions = [...dbQuestions].sort((a, b) => a.order - b.order);

    // Group questions by parent
    sortedQuestions.forEach(q => {
      if (q.parentQuestion) {
        if (!questionGroups[q.parentQuestion]) {
          questionGroups[q.parentQuestion] = { parent: null, children: [] };
        }
        questionGroups[q.parentQuestion].children.push(q);
      } else {
        if (!questionGroups[q.questionId]) {
          questionGroups[q.questionId] = { parent: q, children: [] };
        } else {
          questionGroups[q.questionId].parent = q;
        }
      }
    });

    // Process each question group
    Object.keys(questionGroups).forEach(groupId => {
      const group = questionGroups[groupId];
      const parentQ = group.parent;
      if (!parentQ) return;

      // Special handling for Q1 (Country dropdown)
      if (parentQ.questionId === 'Q1') {
        const countries = countryList().getData();
        processedQuestions.push({
          id: parentQ.questionId,
          text: parentQ.text,
          type: 'dropdown',
          options: countries.map(c => ({ value: c.label, label: c.label })),
          category: parentQ.category,
          subcategory: parentQ.subcategory,
          conditionalLogic: parentQ.conditionalLogic
        });
        return;
      }

      // Create grid for questions with children that have options
      if (group.children.length > 0) {
        const firstChild = group.children[0];
        if (firstChild.options && firstChild.options.length > 0) {
          processedQuestions.push({
            id: groupId,
            text: parentQ.text,
            type: 'grid',
            options: firstChild.options || [],
            subQuestions: group.children.map(child => ({
              id: child.questionId,
              text: child.text,
              options: child.options || []
            })),
            category: parentQ.category,
            subcategory: parentQ.subcategory,
            conditionalLogic: parentQ.conditionalLogic
          });
        } else {
          // If children don't have options, treat parent as info question
          processedQuestions.push({
            id: parentQ.questionId,
            text: parentQ.text,
            type: 'info',
            options: [],
            category: parentQ.category,
            subcategory: parentQ.subcategory,
            conditionalLogic: parentQ.conditionalLogic
          });
        }
      } else {
        // Single question processing
        let questionType = 'single';
        let options = parentQ.options || [];

        // Determine question type based on database type and options
        if (
          parentQ.type === 'boolean' ||
          (options.length === 2 &&
           options.some(opt => opt.label === 'Yes') &&
           options.some(opt => opt.label === 'No'))
        ) {
          questionType = 'yesno';
        } else if (
          parentQ.type === 'likert_5' ||
          (options.length >= 4 &&
           (parentQ.text.toLowerCase().includes('agree') ||
            parentQ.text.toLowerCase().includes('able')))
        ) {
          questionType = 'scale';
        } else if (options.length > 0) {
          questionType = 'single';
        } else {
          // No options = info question
          questionType = 'info';
        }

        processedQuestions.push({
          id: parentQ.questionId,
          text: parentQ.text,
          type: questionType,
          options: options,
          category: parentQ.category,
          subcategory: parentQ.subcategory,
          conditionalLogic: parentQ.conditionalLogic
        });
      }
    });

    return processedQuestions;
  };

  // Check if question should be shown based on conditional logic
  const shouldShowQuestion = (question) => {
    if (!question.conditionalLogic) return true;
    const { showIf } = question.conditionalLogic;
    if (!showIf) return true;
    const dependentAnswer = answers[showIf.questionId];
    return dependentAnswer === showIf.value;
  };

  // Get current question (skip hidden questions)
  const getCurrentQuestion = () => {
    for (let i = currentQuestionIndex; i < questions.length; i++) {
      if (shouldShowQuestion(questions[i])) {
        return { question: questions[i], index: i };
      }
    }
    return null;
  };

  const currentQuestionData = getCurrentQuestion();
  const currentQuestion = currentQuestionData?.question;

  // Validation function that handles all data types
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return true;

    if (currentQuestion.type === 'grid') {
      return currentQuestion.subQuestions.every(subQ => {
        const answer = answers[subQ.id];
        return answer !== undefined && answer !== null && answer !== '';
      });
    } else if (currentQuestion.type === 'info') {
      return true;
    } else {
      const answer = answers[currentQuestion.id];
      if (answer === undefined || answer === null) return false;
      if (typeof answer === 'string') {
        return answer.trim() !== '';
      }
      return true;
    }
  };

  // Calculate progress correctly
  const getVisibleQuestions = () => {
    return questions.filter(q => shouldShowQuestion(q));
  };

  const visibleQuestions = getVisibleQuestions();
  const currentVisibleIndex = visibleQuestions.findIndex(
    q => q.id === currentQuestion?.id
  );
  const progress =
    visibleQuestions.length > 0 && currentVisibleIndex >= 0
      ? ((currentVisibleIndex + 1) / visibleQuestions.length) * 100
      : 0;

  // Handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Store demographics for Q1 and Q1_1
    if (['Q1', 'Q1_1', 'Q2', 'Q3', 'Q4', 'Q5'].includes(questionId)) {
      const demographicKey = {
        'Q1': 'country',
        'Q1_1': 'state',
        'Q2': 'location',
        'Q3': 'age',
        'Q4': 'gender',
        'Q5': 'terminalIllness'
      }[questionId];

      if (demographicKey) {
        setDemographics(prev => ({
          ...prev,
          [demographicKey]: value
        }));
      }
    }

    if (validationError) {
      setValidationError('');
    }
  };

  const nextQuestion = () => {
    setValidationError('');
    if (!isCurrentQuestionAnswered()) {
      setValidationError('Please answer this question before proceeding.');
      return;
    }

    let nextIndex = currentQuestionIndex + 1;
    while (nextIndex < questions.length && !shouldShowQuestion(questions[nextIndex])) {
      nextIndex++;
    }
    setCurrentQuestionIndex(nextIndex);
  };

  const prevQuestion = () => {
    setValidationError('');
    let prevIndex = currentQuestionIndex - 1;
    while (prevIndex >= 0 && !shouldShowQuestion(questions[prevIndex])) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const completeAssessment = () => {
    setValidationError('');
    if (!isCurrentQuestionAnswered()) {
      setValidationError('Please answer this question before completing the assessment.');
      return;
    }

    const unansweredQuestions = visibleQuestions.filter(q => {
      if (q.type === 'grid') {
        return !q.subQuestions.every(subQ => {
          const answer = answers[subQ.id];
          return answer !== undefined && answer !== null && answer !== '';
        });
      } else if (q.type === 'info') {
        return false;
      } else {
        const answer = answers[q.id];
        if (answer === undefined || answer === null) return true;
        if (typeof answer === 'string') {
          return answer.trim() === '';
        }
        return false;
      }
    });

    if (unansweredQuestions.length > 0) {
      setValidationError(
        `Please answer all questions. You have ${unansweredQuestions.length} unanswered questions.`
      );
      return;
    }

    navigate('/results', {
      state: {
        answers,
        demographics
      }
    });
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'dropdown':
        // Special handling for Q1 (Country of residence)
        if (currentQuestion.id === 'Q1') {
          return (
            <div className="question-content">
              <h2>{currentQuestion.text}</h2>

              {/* Country dropdown (searchable) */}
              <CustomDropdown
                value={answers['Q1'] || ''}
                onChange={(value) => handleAnswerChange('Q1', value)}
                options={currentQuestion.options}
                placeholder="Select a country..."
              />

              {/* Q1_1: Plain <select> for state, only if country === Australia */}
              {answers['Q1'] === 'Australia' && (
                <div className="state-select-wrapper">
                  <label htmlFor="Q1_1" className="state-label">
                    Name of State
                  </label>
                  <select
                    id="Q1_1"
                    name="Q1_1"
                    className="state-select-simple"
                    value={answers['Q1_1'] || ''}
                    onChange={(e) => handleAnswerChange('Q1_1', e.target.value)}
                  >
                    <option value="">Select a state...</option>
                    {australiaStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        }
        // All other dropdown questions
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <CustomDropdown
              value={answers[currentQuestion.id] || ''}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              options={currentQuestion.options}
              placeholder="Select an option..."
            />
          </div>
        );

      case 'single':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <div className="antd-radio-wrapper">
              <Radio.Group
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                value={answers[currentQuestion.id]}
                size="large"
                style={{ width: '100%' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%', display: 'flex' }}>
                  {currentQuestion.options.map(option => (
                    <div
                      key={option.value}
                      className="radio-option-container"
                      onClick={() => handleAnswerChange(currentQuestion.id, option.value)}
                    >
                      <Radio 
                        value={option.value}
                        className="custom-radio-option"
                        style={{ width: '100%', display: 'flex', pointerEvents: 'none' }}
                      >
                        {option.label}
                      </Radio>
                    </div>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </div>
        );

      case 'yesno':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <div className="yesno-options">
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  className={`yesno-btn ${
                    answers[currentQuestion.id] === option.value ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerChange(currentQuestion.id, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'scale':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <div className="antd-radio-wrapper">
              <Radio.Group
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                value={answers[currentQuestion.id]}
                size="large"
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {currentQuestion.options.map(option => (
                    <Radio 
                      key={option.value} 
                      value={option.value}
                      className="custom-scale-option"
                    >
                      {option.label}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <div className="grid-question">
              {/* Header row with scale options */}
              <div className="grid-header">
                <div className="grid-question-header">Question</div>
                {currentQuestion.options.map(option => (
                  <div key={option.value} className="grid-option-header">
                    {option.value}
                  </div>
                ))}
              </div>
              
              {/* Question rows with Ant Design Radio */}
              {currentQuestion.subQuestions.map(subQ => (
                <div key={subQ.id} className="grid-row">
                  <div className="grid-question-text">{subQ.text}</div>
                  <div className="grid-options">
                    <Radio.Group
                      onChange={(e) => handleAnswerChange(subQ.id, e.target.value)}
                      value={answers[subQ.id]}
                      style={{ display: 'flex', width: '100%' }}
                    >
                      {currentQuestion.options.map(option => (
                        <div 
                          key={option.value} 
                          className="grid-radio-cell"
                          onClick={() => handleAnswerChange(subQ.id, option.value)}
                        >
                          <Radio 
                            value={option.value} 
                            style={{ pointerEvents: 'none' }}
                          />
                        </div>
                      ))}
                    </Radio.Group>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="question-content">
            <div className="info-content">
              <h2>{currentQuestion.text}</h2>
              <p className="info-description">This section provides context for the next questions.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <p>Unsupported question type: {currentQuestion.type}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="assessment-container">
        <div className="loading">
          <h2>Loading Assessment...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-container">
        <div className="error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="assessment-container">
        <div className="completion">
          <h2>Assessment Complete!</h2>
          <p>You have completed all {visibleQuestions.length} questions.</p>
          <button className="btn-primary btn-large" onClick={completeAssessment}>
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.max(progress, 4)}%` }}
              title={`Progress: ${progress.toFixed(1)}%`}
            ></div>
          </div>
          <div className="progress-text">
            Question {currentVisibleIndex + 1} of {visibleQuestions.length} ({progress.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="assessment-content">
        {validationError && (
          <div className="validation-error">
            <span className="error-icon">⚠️</span>
            {validationError}
          </div>
        )}
        {renderQuestion()}
      </div>

      <div className="assessment-navigation">
        <button 
          className="btn-secondary"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        <div className="nav-info">
          <span className="category-tag">{currentQuestion.category}</span>
          {currentQuestion.subcategory && (
            <span className="subcategory-tag">{currentQuestion.subcategory}</span>
          )}
        </div>

        {currentQuestionIndex >= questions.length - 1 || !questions.slice(currentQuestionIndex + 1).some(q => shouldShowQuestion(q)) ? (
          <button 
            className="btn-primary btn-complete"
            onClick={completeAssessment}
          >
            Complete Assessment
          </button>
        ) : (
          <button 
            className="btn-primary"
            onClick={nextQuestion}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
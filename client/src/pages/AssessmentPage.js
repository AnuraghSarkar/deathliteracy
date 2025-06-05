import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import countryList from 'react-select-country-list';
import '../styles/AssessmentPage.css';

// Custom Dropdown Component
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
          
          // Process and format questions
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

      // If has children, create grid question
      if (group.children.length > 0) {
        const firstChild = group.children[0];
        
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
        // Single question
        let questionType = parentQ.type;
        let options = parentQ.options || [];

        // Special handling for country dropdown
        if (parentQ.questionId === 'Q1') {
          questionType = 'dropdown';
          const countries = countryList().getData();
          options = countries.map(c => ({
            value: c.label,
            label: c.label
          }));
        } else if (parentQ.type === 'boolean') {
          questionType = 'yesno';
        } else if (parentQ.type === 'single_choice') {
          questionType = 'single';
        } else if (parentQ.type === 'scale') {
          questionType = 'scale';
        }

        // Check if it's an info question (no options)
        if (options.length === 0 && parentQ.questionId !== 'Q1') {
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

  // Validation function
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return true;

    if (currentQuestion.type === 'grid') {
      // For grid questions, check if all sub-questions are answered
      return currentQuestion.subQuestions.every(subQ => 
        answers[subQ.id] && answers[subQ.id].trim() !== ''
      );
    } else if (currentQuestion.type === 'info') {
      // Info questions don't require answers
      return true;
    } else {
      // For single questions, check if answered
      const answer = answers[currentQuestion.id];
      return answer && answer.trim() !== '';
    }
  };

  // Calculate progress correctly
  const getVisibleQuestions = () => {
    return questions.filter(q => shouldShowQuestion(q));
  };

  const visibleQuestions = getVisibleQuestions();
  const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === currentQuestion?.id);
  const progress = visibleQuestions.length > 0 && currentVisibleIndex >= 0
    ? ((currentVisibleIndex + 1) / visibleQuestions.length) * 100 
    : 0;

  const handleAnswerChange = (questionId, value, isGrid = false) => {
    if (isGrid) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
      
      // Store demographics
      if (['Q1', 'Q1a', 'Q2', 'Q3', 'Q4', 'Q5'].includes(questionId)) {
        const demographicKey = {
          'Q1': 'country',
          'Q1a': 'state', 
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
    }
  };

  const nextQuestion = () => {
    // Clear previous validation error
    setValidationError('');
    
    // Validate current question before proceeding
    if (!isCurrentQuestionAnswered()) {
      setValidationError('Please answer this question before proceeding.');
      return;
    }

    let nextIndex = currentQuestionIndex + 1;
    
    // Find next visible question
    while (nextIndex < questions.length && !shouldShowQuestion(questions[nextIndex])) {
      nextIndex++;
    }
    
    setCurrentQuestionIndex(nextIndex);
  };

  const prevQuestion = () => {
    // Clear validation error when going back
    setValidationError('');
    
    let prevIndex = currentQuestionIndex - 1;
    
    // Find previous visible question
    while (prevIndex >= 0 && !shouldShowQuestion(questions[prevIndex])) {
      prevIndex--;
    }
    
    if (prevIndex >= 0) {
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const completeAssessment = () => {
    // Clear previous validation error
    setValidationError('');
    
    // Validate current question before completing
    if (!isCurrentQuestionAnswered()) {
      setValidationError('Please answer this question before completing the assessment.');
      return;
    }

    // Check if all visible questions are answered
    const unansweredQuestions = visibleQuestions.filter(q => {
      if (q.type === 'grid') {
        return !q.subQuestions.every(subQ => 
          answers[subQ.id] && answers[subQ.id].trim() !== ''
        );
      } else if (q.type === 'info') {
        return false; // Info questions don't need answers
      } else {
        const answer = answers[q.id];
        return !answer || answer.trim() === '';
      }
    });

    if (unansweredQuestions.length > 0) {
      setValidationError(`Please answer all questions. You have ${unansweredQuestions.length} unanswered questions.`);
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
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <CustomDropdown
              value={answers[currentQuestion.id] || ''}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              options={currentQuestion.options}
              placeholder="Select a country..."
            />
          </div>
        );

      case 'single':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <div className="options-grid">
              {currentQuestion.options.map(option => (
                <label key={option.value} className="option-label">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                  <span className="option-text">{option.label}</span>
                </label>
              ))}
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
                  className={`yesno-btn ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
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
            <div className="scale-options">
              {currentQuestion.options.map(option => (
                <label key={option.value} className="scale-option">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                  <span className="scale-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <div className="grid-question">
              {currentQuestion.subQuestions.map(subQ => (
                <div key={subQ.id} className="grid-row">
                  <div className="grid-question-text">{subQ.text}</div>
                  <div className="grid-options">
                    {currentQuestion.options.map(option => (
                      <label key={option.value} className="grid-option">
                        <input
                          type="radio"
                          name={subQ.id}
                          value={option.value}
                          checked={answers[subQ.id] === option.value}
                          onChange={(e) => handleAnswerChange(subQ.id, e.target.value, true)}
                        />
                        <span className="grid-option-text">{option.value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <p className="info-text">This section contains multiple related questions.</p>
          </div>
        );

      default:
        return (
          <div className="question-content">
            <h2>{currentQuestion.text}</h2>
            <p>Question type not supported: {currentQuestion.type}</p>
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
            <span className="error-icon">!</span>
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

        {currentQuestionIndex === questions.length - 1 ? (
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
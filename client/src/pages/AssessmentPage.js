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

      // Special handling for Q1 (Country dropdown)
      if (parentQ.questionId === 'Q1') {
        const countries = countryList().getData();
        processedQuestions.push({
          id: parentQ.questionId,
          text: parentQ.text,
          type: 'dropdown',
          options: countries.map(c => ({
            value: c.label,
            label: c.label
          })),
          category: parentQ.category,
          subcategory: parentQ.subcategory,
          conditionalLogic: parentQ.conditionalLogic
        });
        return;
      }

      // Create grid for questions with children that have options
      if (group.children.length > 0) {
        const firstChild = group.children[0];
        
        // Only create grid if children have actual options
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
        if (parentQ.type === 'boolean' || 
            (options.length === 2 && 
             options.some(opt => opt.label === 'Yes') && 
             options.some(opt => opt.label === 'No'))) {
          questionType = 'yesno';
        } else if (parentQ.type === 'likert_5' || 
                   (options.length >= 4 && 
                    (parentQ.text.toLowerCase().includes('agree') || 
                     parentQ.text.toLowerCase().includes('able')))) {
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
      // For grid questions, check if all sub-questions are answered
      return currentQuestion.subQuestions.every(subQ => {
        const answer = answers[subQ.id];
        return answer !== undefined && answer !== null && answer !== '';
      });
    } else if (currentQuestion.type === 'info') {
      // Info questions don't require answers
      return true;
    } else {
      // For single questions, check if answered (works for strings, numbers, booleans)
      const answer = answers[currentQuestion.id];
      if (answer === undefined || answer === null) return false;
      
      // Handle string answers (like country dropdown)
      if (typeof answer === 'string') {
        return answer.trim() !== '';
      }
      
      // Handle number answers (like radio buttons with numeric values)
      return true; // If answer exists and is not null/undefined, it's valid
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

  // ENHANCED: Handle answer changes with custom radio button support
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
    }
    
    // Clear validation error when user answers
    if (validationError) {
      setValidationError('');
    }

    // ENHANCED: Update visual state for custom radio buttons
    setTimeout(() => {
      updateCustomRadioVisualState(questionId, value, isGrid);
    }, 0);
  };

  // NEW: Function to handle custom radio button visual states
  const updateCustomRadioVisualState = (questionId, value, isGrid) => {
    if (isGrid) {
      // Handle grid radio buttons
      document.querySelectorAll(`input[name="${questionId}"]`).forEach(input => {
        const gridOption = input.closest('.grid-option');
        if (gridOption) {
          gridOption.classList.remove('selected');
        }
      });
      
      const checkedInput = document.querySelector(`input[name="${questionId}"]:checked`);
      if (checkedInput) {
        const gridOption = checkedInput.closest('.grid-option');
        if (gridOption) {
          gridOption.classList.add('selected');
        }
      }
    } else {
      // Handle regular radio buttons (single choice and scale)
      document.querySelectorAll(`input[name="${questionId}"]`).forEach(input => {
        const optionLabel = input.closest('.option-label, .scale-option');
        if (optionLabel) {
          optionLabel.classList.remove('selected');
        }
      });
      
      const checkedInput = document.querySelector(`input[name="${questionId}"]:checked`);
      if (checkedInput) {
        const optionLabel = checkedInput.closest('.option-label, .scale-option');
        if (optionLabel) {
          optionLabel.classList.add('selected');
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
        return !q.subQuestions.every(subQ => {
          const answer = answers[subQ.id];
          return answer !== undefined && answer !== null && answer !== '';
        });
      } else if (q.type === 'info') {
        return false; // Info questions don't need answers
      } else {
        const answer = answers[q.id];
        if (answer === undefined || answer === null) return true;
        
        // Handle string answers
        if (typeof answer === 'string') {
          return answer.trim() === '';
        }
        
        // Handle non-string answers (numbers, etc.)
        return false; // If answer exists and is not null/undefined, it's answered
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
                    className="radio-input"
                  />
                  <span className="radio-custom"></span>
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
            <div className="scale-container">
              <div className="scale-options">
                {currentQuestion.options.map(option => (
                  <label key={option.value} className="scale-option">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option.value}
                      checked={answers[currentQuestion.id] === option.value}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="scale-input"
                    />
                    <span className="scale-custom"></span>
                    <span className="scale-label">{option.label}</span>
                  </label>
                ))}
              </div>
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
              
              {/* Question rows */}
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
                          className="grid-radio"
                        />
                        <span className="grid-radio-custom"></span>
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
            <div className="info-content">
              <h2>{currentQuestion.text}</h2>
              <p className="info-description">This section will ask you about related topics.</p>
            </div>
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
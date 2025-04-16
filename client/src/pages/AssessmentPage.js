import React, { useState, useContext } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import ThemeContext from '../context/ThemeContext';
import rawQuestions from '../data/questions';

const AssessmentPage = () => {
  const { darkMode } = useContext(ThemeContext);

  const countryOptions = countryList().getData().map(c => ({
    value: c.label,
    label: c.label,
  }));

  const questions = rawQuestions.map(q => {
    if (q.id === 'Q1') {
      return { ...q, type: 'dropdown', options: countryOptions };
    }
    return q;
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [errorPopup, setErrorPopup] = useState('');

  const shouldShowQuestion = (question) => {
    if (question.id === 'Q1a') {
      return userAnswers['Q1'] === 'Australia';
    }
    return true;
  };

  const visibleQuestions = questions.filter(shouldShowQuestion);
  const question = visibleQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / visibleQuestions.length) * 100;

  const isQuestionAnswered = (question) => {
    if (!shouldShowQuestion(question)) return true;
    if (question.type === 'grid') {
      return question.subQuestions.every(subQ => userAnswers[subQ.id]);
    }
    return userAnswers[question.id] !== undefined;
  };

  const handleAnswerSelect = (id, value, type = 'single') => {
    if (type === 'multiple') {
      const currentValues = userAnswers[id] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setUserAnswers({ ...userAnswers, [id]: newValues });
    } else {
      setUserAnswers({ ...userAnswers, [id]: value });
    }
  };

  const handleNext = () => {
    const currentQ = visibleQuestions[currentQuestion];
    if (!isQuestionAnswered(currentQ)) {
      setErrorPopup('Please answer all parts of this question before continuing.');
      return;
    }
    setErrorPopup('');
    if (currentQuestion < visibleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    setErrorPopup('');
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const renderQuestion = (q) => {
    if (!shouldShowQuestion(q)) return null;

    if (q.type === 'grid') {
      return (
        <div className="grid-question">
          <div className="grid-header-text">{q.text}</div>
          <table className="grid-table">
            <thead>
              <tr>
                <th></th>
                {q.options.map(opt => <th key={opt.value}>{opt.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {q.subQuestions.map(sub => (
                <tr key={sub.id}>
                  <td>{sub.text}</td>
                  {q.options.map(opt => (
                    <td key={opt.value}>
                      <input
                        type="radio"
                        name={sub.id}
                        value={opt.value}
                        checked={userAnswers[sub.id] === opt.value}
                        onChange={() => handleAnswerSelect(sub.id, opt.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (q.type === 'dropdown') {
      return (
        <div className="dropdown-question">
          <label>{q.text}</label>
          {q.id === 'Q1' ? (
            <Select
              options={q.options}
              value={q.options.find(c => c.label === userAnswers[q.id]) || null}
              onChange={(selected) => handleAnswerSelect(q.id, selected.label)}
              placeholder="Select a country"
            />
          ) : (
            <select
              className="form-control"
              value={userAnswers[q.id] || ''}
              onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {q.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
      );
    }

    return (
      <div className="options-container">
        <h2 className="question-text">{q.text}</h2>
        {q.options.map(opt => (
          <button
            key={opt.value}
            className={`option-item ${userAnswers[q.id] === opt.value ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect(q.id, opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  const startQuiz = () => setQuizStarted(true);
  const resetQuiz = () => {
    setUserAnswers({});
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setQuizStarted(false);
    setErrorPopup('');
  };

  if (!quizStarted) {
    return (
      <div className="assessment-container">
        <div className="assessment-intro">
          <h1 className="assessment-title">Death Literacy Assessment</h1>
          <p className="assessment-description">Click below to begin.</p>
          <button className="btn-primary" onClick={startQuiz}>Start Assessment</button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="assessment-container">
        <div className="assessment-results">
          <h1>Assessment Completed</h1>
          <p>Thanks for completing the assessment. Your answers have been recorded.</p>
          <button className="btn-secondary" onClick={resetQuiz}>Take Again</button>
        </div>
      </div>
    );
  }

  if (!question) {
    return <div className="assessment-container"><p>All questions complete!</p></div>;
  }

  return (
    <div className="assessment-container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-text">Question {currentQuestion + 1} of {visibleQuestions.length}</div>
      </div>

      {errorPopup && (
    <div className="popup-overlay">
        <div className="popup-box">
        <h3>⚠️ Attention</h3>
        <p>{errorPopup}</p>
        <button className="popup-close-btn" onClick={() => setErrorPopup('')}>OK</button>
        </div>
    </div>
)}


      {renderQuestion(question)}

      <div className="question-navigation">
        <button className="btn-secondary" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </button>
        <button className="btn-primary" onClick={handleNext}>
          {currentQuestion < visibleQuestions.length - 1 ? 'Next' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentPage;

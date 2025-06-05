import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaClipboardList, FaClock, FaUserShield, FaChartLine, FaLightbulb, FaUsers, FaArrowRight, FaCheck, FaBookOpen, FaBrain, FaComments } from 'react-icons/fa';
import '../styles/OnboardingScreen.css';
const OnboardingScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [consent, setConsent] = useState({
    dataCollection: false,
    research: false,
    understood: false
  });

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('userInfo');

  const steps = [
    {
      id: 'welcome',
      title: 'Understanding Death Literacy',
      content: (
        <div className="onboarding-step">
          <div className="step-icon-large">
            <FaHeart size={80} />
          </div>
          <h1>Welcome to the Death Literacy Assessment</h1>
          <p className="step-description">
            Death literacy is your knowledge, skills, and capacity to engage with death, dying, and bereavement in a meaningful and informed way. This includes understanding end-of-life care options, supporting others through loss, and navigating the systems and resources available during difficult times.
          </p>
          <div className="benefits-grid">
            <div className="benefit-card">
              <FaBrain className="benefit-icon" />
              <h3>Self-Understanding</h3>
              <p>Discover your current knowledge and confidence levels around end-of-life matters</p>
            </div>
            <div className="benefit-card">
              <FaChartLine className="benefit-icon" />
              <h3>Benchmarked Results</h3>
              <p>Compare your results with Australian national averages across different areas</p>
            </div>
            <div className="benefit-card">
              <FaLightbulb className="benefit-icon" />
              <h3>Personalized Insights</h3>
              <p>Receive tailored recommendations for improving your death literacy</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'what-to-expect',
      title: 'What to Expect',
      content: (
        <div className="onboarding-step">
          <div className="step-icon-large">
            <FaClipboardList size={80} />
          </div>
          <h1>About This Assessment</h1>
          <p className="step-description">
            This assessment is based on the scientifically validated Death Literacy Index, developed by researchers to measure key aspects of death literacy across different populations.
          </p>
          <div className="assessment-details">
            <div className="detail-card">
              <FaClock className="detail-icon" />
              <h3>15-20 minutes</h3>
              <p>Complete the assessment at your own pace</p>
            </div>
            <div className="detail-card">
              <FaComments className="detail-icon" />
              <h3>4 Key Areas</h3>
              <p>Skills, Experience, Knowledge & Community</p>
            </div>
            <div className="detail-card">
              <FaUserShield className="detail-icon" />
              <h3>Confidential</h3>
              <p>Your responses are private and secure</p>
            </div>
          </div>
          <div className="categories-preview">
            <h3>Assessment Categories:</h3>
            <div className="categories-grid">
              <div className="category-item">
                <FaComments className="category-icon" />
                <span>Practical Skills</span>
                <small>Conversations and hands-on care</small>
              </div>
              <div className="category-item">
                <FaBookOpen className="category-icon" />
                <span>Experience</span>
                <small>Personal encounters with death and loss</small>
              </div>
              <div className="category-item">
                <FaBrain className="category-icon" />
                <span>Knowledge</span>
                <small>Understanding systems and processes</small>
              </div>
              <div className="category-item">
                <FaUsers className="category-icon" />
                <span>Community</span>
                <small>Finding and providing support</small>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'consent',
      title: 'Privacy & Consent',
      content: (
        <div className="onboarding-step">
          <div className="step-icon-large">
            <FaUserShield size={80} />
          </div>
          <h1>Your Privacy Matters</h1>
          <p className="step-description">
            We are committed to protecting your privacy. Please review and confirm your preferences below.
          </p>
          <div className="consent-section">
            <div className="consent-card">
              <div className="consent-header">
                <FaUserShield className="consent-icon" />
                <h3>Data Collection & Use</h3>
              </div>
              <p>We collect your assessment responses to generate your personalized report and improve our service. Your data is stored securely and never shared with third parties.</p>
              <label className="consent-checkbox">
                <input
                  type="checkbox"
                  checked={consent.dataCollection}
                  onChange={(e) => setConsent({...consent, dataCollection: e.target.checked})}
                />
                <span className="checkmark"></span>
                I consent to the collection and use of my assessment data as described above
              </label>
            </div>
            
            <div className="consent-card">
              <div className="consent-header">
                <FaChartLine className="consent-icon" />
                <h3>Research Participation (Optional)</h3>
              </div>
              <p>Your anonymized responses may help advance death literacy research and improve end-of-life care. You can opt out at any time without affecting your assessment results.</p>
              <label className="consent-checkbox">
                <input
                  type="checkbox"
                  checked={consent.research}
                  onChange={(e) => setConsent({...consent, research: e.target.checked})}
                />
                <span className="checkmark"></span>
                I consent to my anonymized data being used for research purposes
              </label>
            </div>

            <div className="consent-card">
              <div className="consent-header">
                <FaCheck className="consent-icon" />
                <h3>Understanding</h3>
              </div>
              <p>This assessment provides educational insights about death literacy. It is not a substitute for professional medical, legal, or psychological advice.</p>
              <label className="consent-checkbox required">
                <input
                  type="checkbox"
                  checked={consent.understood}
                  onChange={(e) => setConsent({...consent, understood: e.target.checked})}
                />
                <span className="checkmark"></span>
                I understand the purpose and limitations of this assessment
              </label>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartAssessment = async () => {
  if (!consent.dataCollection || !consent.understood) {
    alert('Please confirm your consent to data collection and understanding of the assessment before proceeding.');
    return;
  }

  // Store consent preferences
  localStorage.setItem('assessmentConsent', JSON.stringify(consent));

  if (isLoggedIn) {
    // Mark onboarding as completed
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put('/api/users/complete-onboarding', {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
    
    navigate('/assessment');
  } else {
    navigate('/register', { 
      state: { 
        fromOnboarding: true,
        consent: consent
      }
    });
  }
};

  const canProceed = () => {
    if (currentStep === steps.length - 1) {
      return consent.dataCollection && consent.understood;
    }
    return true;
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-wrapper">
        {/* Progress Bar */}
        <div className="progress-header">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="step-container">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="navigation-container">
          <div className="nav-buttons">
            <button 
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button 
                className={`btn-primary btn-start ${canProceed() ? '' : 'disabled'}`}
                onClick={handleStartAssessment}
                disabled={!canProceed()}
              >
                {isLoggedIn ? 'Start Assessment' : 'Continue to Registration'}
                <FaArrowRight className="btn-icon" />
              </button>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleNext}
              >
                Next
                <FaArrowRight className="btn-icon" />
              </button>
            )}
          </div>
          
          {isLoggedIn && (
            <div className="skip-option">
              <button 
                className="btn-link"
                onClick={() => navigate('/assessment')}
              >
                Skip to Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
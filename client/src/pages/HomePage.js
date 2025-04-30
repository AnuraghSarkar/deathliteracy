import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import yourSvgImage from '../styles/public/images/background.svg'; // Update path if needed

const HomePage = () => {
  const { darkMode, isTransitioning } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  // Check if user is logged in by checking for JWT token in localStorage
  const isLoggedIn = localStorage.getItem('userInfo');

  const handleStartQuiz = () => {
    if (isLoggedIn) {
      // If user is logged in, navigate to the quiz
      navigate('/assessment');
    } else {
      // If not logged in, redirect to the login page
      navigate('/login');
    }
  };

  return (
    <div className="homepage-wrapper">
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h2 className="hero-subtitle">THE BEST WAY TO UNDERSTAND</h2>
            <h1 className="hero-title">DEATH LITERACY</h1>
            <p className="hero-text">
              Enhance your knowledge of end-of-life planning and bereavement with our engaging assessments and resources.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleStartQuiz}>
                Start Quiz Now
              </button>
              <Link to="/login" className="btn-secondary">
                Already have an account?
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img src={yourSvgImage} alt="Death Literacy Symbol" className="circle-image" />
          </div>
        </div>

        <div className={`footer-wave ${isTransitioning ? 'animating' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              className="wave-path"
              fill={darkMode ? '#475569' : '#1F2937'}
              fillOpacity="1"
              d="M0,64L80,85.3C160,107,320,149,480,154.7C640,160,800,128,960,122.7C1120,117,1280,139,1360,149.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

// File: client/src/pages/NotFound.js
import { useNavigate, Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">
          <span className="four">4</span>
          <span className="zero">0</span>
          <span className="four">4</span>
        </div>
        
        <div className="error-message">
          <h1>Page Not Found</h1>
          <p>Sorry, the page you're looking for doesn't exist or has been moved.</p>
        </div>
        
        <div className="error-illustration">
          <div className="skull">💀</div>
          <div className="floating-text">Lost in the void...</div>
        </div>
        
        <div className="action-buttons">
          <button className="btn-primary" onClick={goHome}>
            🏠 Go to Homepage
          </button>
          <button className="btn-secondary" onClick={goBack}>
            ← Go Back
          </button>
          <Link to="/assessment" className="btn-secondary">
            📝 Take Assessment
          </Link>
        </div>
        
        <div className="helpful-links">
          <h3>Maybe you were looking for:</h3>
          <ul>
            <li><Link to="/">Death Literacy Homepage</Link></li>
            <li><Link to="/assessment">Take the Assessment</Link></li>
            <li><Link to="/login">Admin Login</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="background-pattern">
        <div className="floating-icon">⚰️</div>
        <div className="floating-icon">🕊️</div>
        <div className="floating-icon">🌹</div>
        <div className="floating-icon">✨</div>
        <div className="floating-icon">🦋</div>
      </div>
    </div>
  );
};

export default NotFound;
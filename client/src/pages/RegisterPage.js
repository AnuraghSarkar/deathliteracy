import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaGoogle } from 'react-icons/fa';  // For Google Icon (optional)

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    demographics: {
      age: '',
      gender: '',
      location: ''
    },
    consentToResearch: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value
        }
      });
    } else if (e.target.name === 'consentToResearch') {
      setFormData({
        ...formData,
        consentToResearch: e.target.checked
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Add more detailed logging
      
      const response = await axios.post('/api/users', formData);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      navigate('/onboarding'); 
    } catch (err) {
      console.error('Registration error details:', {
        message: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
        stack: err.stack
      });
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';  // Redirect to backend for Google OAuth
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <h2 className="auth-title">Sign Up</h2>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-section">
              <h3 className="form-section-title">Demographics (Optional)</h3>
              
              <div className="form-group">
                <label htmlFor="demographics.age" className="form-label">Age</label>
                <input
                  type="number"
                  id="demographics.age"
                  name="demographics.age"
                  className="form-control"
                  value={formData.demographics.age}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="demographics.gender" className="form-label">Gender</label>
                <select
                  id="demographics.gender"
                  name="demographics.gender"
                  className="form-control"
                  value={formData.demographics.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="demographics.location" className="form-label">Location</label>
                <input
                  type="text"
                  id="demographics.location"
                  name="demographics.location"
                  className="form-control"
                  value={formData.demographics.location}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="consentToResearch"
                name="consentToResearch"
                checked={formData.consentToResearch}
                onChange={handleChange}
              />
              <label htmlFor="consentToResearch" className="checkbox-label">
                I consent to my data being used for research purposes
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary auth-button" 
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login" className="auth-link">Log in</Link>
            </p>
          </div>

          {/* Google login button */}
          <button className="btn-google" onClick={handleGoogleLogin}>
            <FaGoogle className="google-icon" /> 
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

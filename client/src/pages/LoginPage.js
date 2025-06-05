import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useAuthContext } from '../context/AuthContext';  // ADD THIS IMPORT

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);  

    // SAFETY CHECK: if login() returned nothing
    if (!result) {
      setError('Login failed - no response');
      setLoading(false);
      return;
    }

    if (result.success) {
      const userData = result.user;

      // —— NEW ADMIN REDIRECT LOGIC —— 
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        const destination = userData.hasCompletedOnboarding ? '/assessment' : '/onboarding';
        navigate(destination);
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route for authentication
    window.location.href = 'http://localhost:5001/api/users/google';
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <h2 className="auth-title">Log In</h2>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
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
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary auth-button" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </p>
          </div>
          
          {/* Google login button */}
          <button className="btn-google" onClick={handleGoogleLogin}>
            <FaGoogle className="google-icon" /> 
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

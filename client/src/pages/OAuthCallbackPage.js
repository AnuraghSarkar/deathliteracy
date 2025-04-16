import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    
    if (token) {
      // Save the JWT token to localStorage
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      // Redirect to the assessment page
      navigate('/assessment');
    } else {
      // Handle error if no token is found
      navigate('/login');
    }
  }, [location.search, navigate]);

  return <div>Loading...</div>;
};

export default OAuthCallbackPage;

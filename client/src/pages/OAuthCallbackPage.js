import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthContext();

useEffect(() => {
  const handleOAuthCallback = () => {
    try {  
      // Check for different possible parameter names
      const userDataString = searchParams.get('userData');
      const token = searchParams.get('token');
      
      if (userDataString) {
        const userData = JSON.parse(decodeURIComponent(userDataString));
        
        // After parsing userData, add debug

        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);        
        const destination = userData.hasCompletedOnboarding ? '/assessment' : '/onboarding';
        
        navigate(destination);
      } else if (token) {
        // Handle old token-only format
        console.log('Received token only, need to fetch user data');
        // We'll need to fetch user data using the token
      } else {
        console.error('No user data received from Google OAuth');
        navigate('/login?error=oauth_failed');
      }
    } catch (error) {
      navigate('/login?error=oauth_failed');
    }
  };

  handleOAuthCallback();
}, [navigate, searchParams, setUser]);

  return (
    <div className="oauth-callback">
      <div className="container">
        <div className="loading-container">
          <h2>Completing Google Sign In...</h2>
          <p>Please wait while we redirect you.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
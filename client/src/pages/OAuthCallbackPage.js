import { useEffect } from 'react';

const OAuthCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userDataString = urlParams.get('userData');
    
    console.log('OAuth Callback - Processing once...');
    
    if (userDataString) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataString));
        console.log('Storing user data and redirecting...');
        
        // Store data in localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        // Redirect using window.location (this will cause a full page reload and stop the loop)
        const destination = userData.hasCompletedOnboarding ? '/assessment' : '/onboarding';
        window.location.replace(destination);
        
      } catch (error) {
        console.error('OAuth parsing error:', error);
        window.location.replace('/login?error=oauth_failed');
      }
    } else {
      console.error('No userData in URL');
      window.location.replace('/login?error=oauth_failed');
    }
  }, []); // Empty dependency array - runs only once

  return (
    <div className="oauth-callback">
      <div className="container">
        <div className="loading-container">
          <h2>Completing Google Sign In...</h2>
          <p>Please wait while we redirect you...</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userInfo);
      const user = userData.user || userData; // Handle both formats
      setUser(user);
    } catch (error) {
      localStorage.removeItem('userInfo');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', { email, password });
      if (response.data && response.data._id) {  // Check if user data exists
        const userData = response.data;
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);  // Set the user data directly
        
        return { 
          success: true, 
          user: userData  // Return the user data directly
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // **NEW: Add updateUser function to sync localStorage with context**
  const updateUser = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    
    // Update both context state and localStorage
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    
    console.log('✅ User updated in AuthContext:', updates);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('onboardingCompleted'); // Clean up onboarding flag too
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    setUser,
    updateUser // **NEW: Expose updateUser function**
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
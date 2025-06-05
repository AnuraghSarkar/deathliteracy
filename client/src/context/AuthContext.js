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
      
      // Verify token is still valid
      const response = await axios.get('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('userInfo');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const userData = response.data;
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

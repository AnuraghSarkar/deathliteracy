// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wrap setUser in useCallback to prevent it from changing on every render
  const setUserFromOAuth = useCallback((userData) => {
    // Store token and user info
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    
    // Update context state
    setUser(userData);
  }, []);

  // Wrap login in useCallback
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      
      if (data.token) {
        const { token, ...userFields } = data;

        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(userFields));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const userWithToken = { ...userFields, token };
        setUser(userWithToken);

        return { success: true, user: userWithToken };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed: no token returned',
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login request failed',
      };
    }
  }, []);

  const updateUser = useCallback((updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('userInfo', JSON.stringify(updated));
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userInfo');

    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userFields = JSON.parse(storedUser);
      setUser({ ...userFields, token });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }

    setLoading(false);
  }, []);

  // Memoize the context value
  const contextValue = React.useMemo(() => ({
    user,
    setUser: setUserFromOAuth,
    loading,
    login,
    logout,
    updateUser,
  }), [user, setUserFromOAuth, loading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
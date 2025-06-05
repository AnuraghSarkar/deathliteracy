// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // On mount, read token + userInfo from localStorage (if any)
useEffect(() => {
  const token = localStorage.getItem('adminToken');
  const storedUser = localStorage.getItem('userInfo');

  if (token && storedUser) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Include token in user object
    const userFields = JSON.parse(storedUser);
    setUser({ ...userFields, token });
  } else {
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  setLoading(false);
}, []);

  /**
   * login(email, password)
   *  - calls POST /api/users/login
   *  - backend returns { <all user fields>, token: "<jwt>" }
   *  - we pull out `token`, store it and store “user” in localStorage and state.
   */
const login = async (email, password) => {
  try {
    const { data } = await axios.post('/api/users/login', { email, password });
    
    if (data.token) {
      const { token, ...userFields } = data;

      // Persist in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('userInfo', JSON.stringify(userFields));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update context state - INCLUDE TOKEN HERE
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
};
  /**
   * updateUser(updates)
   *  - merge `updates` into our current `user` state,
   *    then persist updated user back to localStorage.
   */
  const updateUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('userInfo', JSON.stringify(updated));
  };

  /**
   * logout()
   *  - clear both user and token from state/localStorage,
   *    and remove axios default Authorization header.
   */
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

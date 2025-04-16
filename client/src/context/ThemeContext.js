import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user previously had dark mode enabled
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
  
  const [darkMode, setDarkMode] = useState(defaultDark);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsTransitioning(true);
    setDarkMode(!darkMode);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };
  
  // Update localStorage and apply theme when darkMode changes
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
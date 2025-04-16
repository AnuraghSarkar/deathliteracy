import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AssessmentPage from './pages/AssessmentPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
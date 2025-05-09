import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import ThemeContext from "../context/ThemeContext";

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in by checking for a JWT token in localStorage
  const isLoggedIn = localStorage.getItem("userInfo");

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem("userInfo"); // Remove JWT token from localStorage
    navigate("/login"); // Redirect to login page after signing out
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">DEATH LITERACY</span>
        </Link>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop and mobile navigation */}
        <div
          className={`navbar-right ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
        >
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Auth buttons */}
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="btn-login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button className="btn-signup" onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import ThemeContext from "../context/ThemeContext";
import { useAuthContext } from "../context/AuthContext";  // ADD THIS IMPORT

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout } = useAuthContext();  // REPLACE localStorage check
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle sign out using AuthContext
  const handleSignOut = () => {
    logout();  // USE AuthContext logout method
    navigate("/login");
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
            {user ? (  /* REPLACE isLoggedIn with user */
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
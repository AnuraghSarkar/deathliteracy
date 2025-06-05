// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken'); // Ensure JWT is imported

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // ← Allow all needed methods
  credentials: true
}));

app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import middleware with Passport configuration
require('./middleware/authMiddleware');

// Simple test route
router.get('/test', (req, res) => {
  res.send('Backend is working!');
});

// Mount the router
app.use('/', router);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Death Literacy API is running');
});

// Google auth routes (IMPORTANT: These should come before your API routes)
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {    
    try {
      // Generate JWT token after Google login
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      // Fetch complete user data from database (including hasCompletedOnboarding)
      const User = require('./models/userModel');
      const fullUser = await User.findById(req.user._id).select('-password');
      
      // Send complete user data (like regular login)
      const userData = {
        _id: fullUser._id,
        username: fullUser.username,
        email: fullUser.email,
        role: fullUser.role,
        hasCompletedOnboarding: fullUser.hasCompletedOnboarding,
        token: token
      };
            
      // Redirect with complete user data
      const redirectURL = `http://localhost:3000/oauth-callback?userData=${encodeURIComponent(JSON.stringify(userData))}`;
      res.redirect(redirectURL);
      
    } catch (error) {
      res.redirect('http://localhost:3000/login?error=oauth_failed');
    }
  }
);

// Define API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));


// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Set port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
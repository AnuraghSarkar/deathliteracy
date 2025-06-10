// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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

// Google auth routes
app.get('/api/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=auth_failed' }),
  async (req, res) => {    
    try {      
      if (!req.user) {
        return res.send(`
          <script>
            if (window.opener) {
              window.opener.postMessage({ success: false, error: 'no_user' }, '*');
              window.close();
            } else {
              window.location.href = 'http://localhost:3000/login?error=auth_failed';
            }
          </script>
        `);
      }

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      const User = require('./models/userModel');
      const fullUser = await User.findById(req.user._id).select('-password');
      
      if (!fullUser) {
        return res.send(`
          <script>
            if (window.opener) {
              window.opener.postMessage({ success: false, error: 'user_not_found' }, '*');
              window.close();
            } else {
              window.location.href = 'http://localhost:3000/login?error=auth_failed';
            }
          </script>
        `);
      }

      const userData = {
        _id: fullUser._id,
        username: fullUser.username,
        email: fullUser.email,
        role: fullUser.role,
        hasCompletedOnboarding: fullUser.hasCompletedOnboarding,
        token: token
      };
      
      // Check if this is a popup (has opener) or direct navigation
      return res.send(`
        <script>
          if (window.opener) {
            // This is a popup - send message to parent and close
            window.opener.postMessage({ 
              success: true, 
              userData: ${JSON.stringify(userData)} 
            }, '*');
            window.close();
          } else {
            // This is direct navigation - redirect normally
            localStorage.setItem('token', '${userData.token}');
            localStorage.setItem('userInfo', '${JSON.stringify(userData)}');
            
            if ('${userData.role}' === 'admin') {
              window.location.href = 'http://localhost:3000/admin';
            } else {
              const destination = ${userData.hasCompletedOnboarding} ? '/assessment' : '/onboarding';
              window.location.href = 'http://localhost:3000' + destination;
            }
          }
        </script>
      `);
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              success: false, 
              error: 'callback_error',
              message: '${error.message}'
            }, '*');
            window.close();
          } else {
            window.location.href = 'http://localhost:3000/login?error=oauth_failed';
          }
        </script>
      `);
    }
  }
);

// Define API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/admin/users', require('./routes/adminRoutes'));
app.use('/api/admin/questions', require('./routes/adminQuestionRoutes'));
app.use('/api/admin/categories', require('./routes/categoryRoutes'));
app.use('/api/admin/assessments', require('./routes/adminAssessmentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  
  if (res.headersSent) {
    console.error('Error after response sent:', err.message);
    return next(err);
  }
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
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
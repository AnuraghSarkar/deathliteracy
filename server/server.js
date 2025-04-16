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
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false
}));

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

// Set port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
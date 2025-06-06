const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5001/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database by Google ID
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser); // User exists, log them in
        } else {
          // Create a new user if they don't exist
          const newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: Math.random().toString(36).slice(-8),  // Random password for OAuth
          });

          await newUser.save();
          return done(null, newUser);  // Return the newly created user
        }
      } catch (error) {
        done(error, null);  // If any error, pass it to the done callback
      }
    }
  )
);

// Serialize and deserialize user into the session
passport.serializeUser((user, done) => done(null, user.id));  // Serialize user ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');  // Use async/await for database operation
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next(); // ← Add return here
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
   
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// new isAdmin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, isAdmin };
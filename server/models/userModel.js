const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // If googleId is present, password is not required
    },
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Makes the googleId field optional for users logging in via email/password
  },
  role: {
    type: String,
    enum: ['individual', 'organization_admin', 'researcher', 'admin'],
    default: 'individual'
  },
  demographics: {
    age: Number,
    gender: String,
    location: String,
    culturalBackground: String
  },
  consentToResearch: {
    type: Boolean,
    default: false
  },
  hasCompletedOnboarding: {  // ADD THIS FIELD
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving if it's not a Google login
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.googleId) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
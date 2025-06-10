const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, './.env') });

// Import User model with correct path
const User = require('./models/userModel');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'enter your admin@mail' });
    if (existingAdmin) {
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'example@deathliteracy.com',
      password: '########', // Will be hashed automatically
      role: 'admin'
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('💡 User with this email or username already exists');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
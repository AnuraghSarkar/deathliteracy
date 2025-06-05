const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, './.env') });

// Import User model with correct path
const User = require('./models/userModel');

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Using URI:', process.env.MONGO_URI ? 'URI found' : 'URI not found');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'enter your admin@mail' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('👤 Username:', existingAdmin.username);
      console.log('🎯 Role:', existingAdmin.role);
      console.log('\nYou can login at: http://localhost:3000/login');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@deathliteracy.com',
      password: '########', // Will be hashed automatically
      role: 'admin'
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@deathliteracy.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 Username:', adminUser.username);
    console.log('🎯 Role:', adminUser.role);
    console.log('\n🚀 Now you can login at: http://localhost:3000/login');
    console.log('🔗 Then go to: http://localhost:3000/admin');
    
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
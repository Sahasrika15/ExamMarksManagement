const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
console.log('MONGO_URI from .env:', process.env.MONGO_URI); // Debug statement

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Users collection cleared');

    // Create dummy users
    const users = [
      {
        name: 'Faculty User',
        email: 'faculty@college.edu',
        password: await bcrypt.hash('facultyPass123', 10),
        role: 'faculty',
        facultyId: 'FAC123',
        department: 'CSE',
      },
      {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        adminId: 'ADM001', // Unique adminId
      },
      {
        name: 'HOD User',
        email: 'hod@college.edu',
        password: await bcrypt.hash('hod123', 10),
        role: 'hod',
        department: 'CSE',
        adminId: 'ADM002', // Unique adminId
      },
    ];

    // Insert users into the database
    await User.insertMany(users);

    console.log('Dummy data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
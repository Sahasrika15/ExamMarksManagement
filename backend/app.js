const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB and create default users
const initializeServer = async () => {
  try {
    await connectDB();

    // Drop the hodId index if it exists
    try {
      await User.collection.dropIndex('hodId_1');
      console.log('Dropped hodId_1 index');
    } catch (err) {
      console.log('No hodId_1 index to drop or error dropping index:', err.message);
    }

    // Drop the facultyId index if it exists
    try {
      await User.collection.dropIndex('facultyId_1');
      console.log('Dropped facultyId_1 index');
    } catch (err) {
      console.log('No facultyId_1 index to drop or error dropping index:', err.message);
    }

    // Check if admin exists
    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      const admin = new User({
        name: 'Administrator',
        email: 'admin@college.edu',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin account created:');
      console.log('Email: admin@college.edu');
      console.log('Password: admin123');
    }

    // Check if faculty exists
    user = await User.findOne({ role: 'faculty' });
    if (!user) {
      const faculty = new User({
        name: 'Faculty Member',
        email: 'faculty@college.edu',
        password: 'facultyPass123',
        role: 'faculty',
        facultyId: 'FAC001',
        department: 'CSE'
      });
      await faculty.save();
      console.log('Default faculty account created:');
      console.log('Email: faculty@college.edu');
      console.log('Password: facultyPass123');
      console.log('Faculty ID: FAC001');
      console.log('Department: CSE');
    }

    // Check if HOD exists
    user = await User.findOne({ role: 'hod' });
    if (!user) {
      const hod = new User({
        name: 'Head of Department',
        email: 'hod@college.edu',
        password: 'hod123',
        role: 'hod',
        department: 'CSE'
      });
      await hod.save();
      console.log('Default HOD account created:');
      console.log('Email: hod@college.edu');
      console.log('Password: hod123');
      console.log('Department: CSE');
    }
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
};

initializeServer();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/marks', require('./routes/markRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate key error: A user with this email already exists',
    });
  }
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Handle 404 errors as JSON
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
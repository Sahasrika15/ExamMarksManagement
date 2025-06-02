const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB and check for admin user
const initializeServer = async () => {
  try {
    await connectDB();
    
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Create default admin user
      const admin = new User({
        name: 'Administrator',
        email: 'admin@admin.com',
        password: 'admin123',
        role: 'admin'
      });
      
      await admin.save();
      console.log('Default admin account created:');
      console.log('Email: admin@admin.com');
      console.log('Password: admin');
    }
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
};

initializeServer();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000','https://edumarks.vercel.app'], // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true, // Allow cookies/credentials
}));
app.use(express.json());

// Routes
app.use('/api/marks', require('./routes/markRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
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
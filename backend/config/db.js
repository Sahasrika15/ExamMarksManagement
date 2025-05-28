const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configure Mongoose with reconnection settings
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if server selection fails
      connectTimeoutMS: 10000, // Timeout after 10 seconds if connection fails
      socketTimeoutMS: 45000, // Close socket after 45 seconds of inactivity
      maxPoolSize: 10, // Limit the number of connections in the pool
      autoIndex: false, // Disable automatic index creation in production
    });

    console.log('MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000); // Retry connection after 5 seconds
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
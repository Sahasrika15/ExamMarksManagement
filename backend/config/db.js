const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configure Mongoose with reconnection settings
    await mongoose.connect(process.env.MONGO_URI, {
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
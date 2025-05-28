const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }

  try {
    console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI.replace(/:.*@/, ':<password>@')); // Hide password in logs
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
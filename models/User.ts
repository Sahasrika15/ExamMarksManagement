import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Faculty User', // Default name for demo user
  },
  role: {
    type: String,
    required: true,
    enum: ['faculty', 'admin', 'hod'],
  },
  facultyId: {
    type: String,
  },
  adminId: {
    type: String,
  },
  hodId: {
    type: String,
  },
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'Administration'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Custom validation for facultyId presence when role is faculty
UserSchema.path('facultyId').validate(function (value) {
  if (this.role === 'faculty') {
    return value != null && value.trim().length > 0;
  }
  return true;
}, 'facultyId is required for faculty role');

// Custom validation for hodId presence when role is hod
UserSchema.path('hodId').validate(function (value) {
  if (this.role === 'hod') {
    return value != null && value.trim().length > 0;
  }
  return true;
}, 'hodId is required for hod role');

// Custom validation for department presence when role is faculty or hod
UserSchema.path('department').validate(function (value) {
  if (this.role === 'faculty' || this.role === 'hod') {
    return value != null && value.trim().length > 0;
  }
  return true;
}, 'department is required for faculty and hod roles');

// Password hashing before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as import('mongoose').CallbackError);
  }
});

// Method to compare passwords during login
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

export default models.User || model('User', UserSchema);
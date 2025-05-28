const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['faculty', 'admin', 'hod'] },
  facultyId: { type: String }, // Only for faculty
  department: { type: String }, // For faculty and HOD
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
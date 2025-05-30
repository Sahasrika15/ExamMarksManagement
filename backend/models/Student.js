const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  batch: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
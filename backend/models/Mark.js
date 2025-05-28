const mongoose = require('mongoose');
const { Schema } = mongoose;

const markSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ['Class Test', 'Mid 1', 'Mid 2', 'Semester Exam', 'Lab Internal', 'Lab External'],
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    scoredMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    comments: {
      type: String,
      default: '',
    },
    enteredBy: {
      type: String, // Faculty ID
    },
    enteredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique marks per student, subject, and exam type
markSchema.index({ studentId: 1, subjectId: 1, examType: 1 }, { unique: true });

module.exports = mongoose.models.Mark || mongoose.model('Mark', markSchema);
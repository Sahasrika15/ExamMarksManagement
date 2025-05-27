import mongoose, { Schema, models, model } from "mongoose";

const markSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ["CT", "Mid 1", "Mid 2", "Semester Exam", "Internal Lab", "External Lab"],
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
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique marks per student, subject, and exam type
markSchema.index({ studentId: 1, subjectId: 1, examType: 1 }, { unique: true });

export const Mark = models.Mark || model("Mark", markSchema);
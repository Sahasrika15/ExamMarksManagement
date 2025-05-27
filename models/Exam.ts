import mongoose, { Schema, models, model } from "mongoose";

const examSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = models.Exam || model("Exam", examSchema);
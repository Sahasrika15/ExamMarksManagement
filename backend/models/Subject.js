const mongoose = require('mongoose');
const { Schema } = mongoose;

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    credits: { type: Number, required: true },
    type: {
      type: String,
      enum: ['Theory', 'Laboratory', 'Project'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
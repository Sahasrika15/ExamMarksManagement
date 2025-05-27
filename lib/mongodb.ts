// MongoDB connection utility
// In production, implement actual MongoDB connection

export interface Student {
  _id?: string
  name: string
  rollNumber: string
  batch: string
  branch: string
  year: number
  semester: number
  email: string
  phone: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Subject {
  _id?: string
  name: string
  code: string
  branch: string
  year: number
  semester: number
  credits: number
  type: "Theory" | "Laboratory" | "Project"
  createdAt?: Date
  updatedAt?: Date
}

export interface Exam {
  _id?: string
  type: "Class Test" | "Mid 1" | "Mid 2" | "Semester Exam" | "Lab Internal" | "Lab External"
  maxMarks: number
  subjectId: string
  date?: Date
  duration?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Mark {
  _id?: string
  studentId: string
  subjectId: string
  examType: string
  maxMarks: number
  scoredMarks: number
  comments?: string
  enteredBy?: string
  enteredAt?: Date
  updatedAt?: Date
}

// MongoDB Schema Examples (for reference)
/*
// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  batch: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  semester: { type: Number, required: true, min: 1, max: 2 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
}, { timestamps: true })

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  semester: { type: Number, required: true, min: 1, max: 2 },
  credits: { type: Number, required: true, min: 1, max: 6 },
  type: { type: String, enum: ['Theory', 'Laboratory', 'Project'], required: true },
}, { timestamps: true })

// Exam Schema
const examSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Class Test', 'Mid 1', 'Mid 2', 'Semester Exam', 'Lab Internal', 'Lab External'],
    required: true 
  },
  maxMarks: { type: Number, required: true, min: 1 },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date },
  duration: { type: Number }, // in minutes
}, { timestamps: true })

// Mark Schema
const markSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examType: { type: String, required: true },
  maxMarks: { type: Number, required: true, min: 1 },
  scoredMarks: { type: Number, required: true, min: 0 },
  comments: { type: String },
  enteredBy: { type: String }, // Faculty ID
  enteredAt: { type: Date, default: Date.now },
}, { timestamps: true })

// Compound index to prevent duplicate entries
markSchema.index({ studentId: 1, subjectId: 1, examType: 1 }, { unique: true })
*/

export const connectMongoDB = async () => {
  // Implement MongoDB connection
  // mongoose.connect(process.env.MONGODB_URI!)
}

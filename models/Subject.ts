import mongoose, { Schema, Document, models } from "mongoose"

export interface ISubject extends Document {
  name: string
  code: string
  branch: string
  year: number
  semester: number
  credits: number
  type: string
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    credits: { type: Number, required: true },
    type: { type: String, enum: ["Theory", "Laboratory", "Project"], required: true },
  },
  { timestamps: true }
)

export default models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema)

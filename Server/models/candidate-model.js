import { Schema, model } from "mongoose"

const phaseSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ["pending", "in-progress", "completed", "skipped"], default: "pending" },
  scheduledAt: { type: Date },
  interviewer: { type: String },
  feedback: { type: String },
  score: { type: Number, min: 1, max: 5 },
  updatedAt: { type: Date },
}, { _id: false })

const candidateSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  roleApplied: { type: String },
  resumeUrl: { type: String },
  source: { type: String },
  currentPhase: { type: String, default: "applied" },
  status: { type: String, enum: ["active", "rejected", "hired"], default: "active" },
  phases: { type: [phaseSchema], default: [] },
  notes: { type: String },
}, { timestamps: true })

const Candidate = model("Candidate", candidateSchema)
export default Candidate

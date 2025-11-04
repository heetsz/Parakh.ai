import { Schema, model } from "mongoose"

const feedbackSchema = new Schema({
  date: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  givenBy: { type: String }, // client contact name/email
}, { _id: false, timestamps: false })

const performanceSchema = new Schema({
  CID: { type: String, required: true, index: true },
  projectName: { type: String, required: true },
  clientName: { type: String },
  role: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ["active", "completed", "on-hold"], default: "active" },
  feedbacks: { type: [feedbackSchema], default: [] },
}, { timestamps: true })

const Performance = model("Performance", performanceSchema)
export default Performance

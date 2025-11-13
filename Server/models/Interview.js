import mongoose from "mongoose";

const conversationTurnSchema = new mongoose.Schema({
  speaker: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  audioUrl: { type: String }, // Cloudinary URL for audio
  timestamp: { type: Date, default: Date.now },
});

const scoreSchema = new mongoose.Schema({
  communication: { type: Number, min: 0, max: 100, default: 0 },
  technicalSkills: { type: Number, min: 0, max: 100, default: 0 },
  problemSolving: { type: Number, min: 0, max: 100, default: 0 },
  confidence: { type: Number, min: 0, max: 100, default: 0 },
  clarity: { type: Number, min: 0, max: 100, default: 0 },
  overall: { type: Number, min: 0, max: 100, default: 0 },
});

const feedbackSchema = new mongoose.Schema({
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  improvements: [{ type: String }],
  nextFocusAreas: [{ type: String }],
  detailedFeedback: { type: String },
});

const interviewSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  role: { type: String, required: true },
  difficulty: { type: String, required: true },
  notes: { type: String, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true }, // denormalized username for easy querying
  status: { type: String, enum: ["pending", "ready", "in_progress", "completed"], default: "pending" },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  scores: { type: scoreSchema, default: {} },
  feedback: { type: feedbackSchema, default: {} },
  conversation: [conversationTurnSchema], // Store full conversation with audio
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);

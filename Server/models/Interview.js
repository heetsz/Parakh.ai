import mongoose from "mongoose";

const conversationTurnSchema = new mongoose.Schema({
  speaker: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  audioUrl: { type: String }, // Cloudinary URL for audio
  timestamp: { type: Date, default: Date.now },
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
  conversation: [conversationTurnSchema], // Store full conversation with audio
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);

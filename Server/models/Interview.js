import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  role: { type: String, default: "" },
  experience: { type: String, default: "" },
  type: { type: String, default: "" },
  difficulty: { type: String, default: "" },
  resume: { type: String, default: "" }, // URL or text
  notes: { type: String, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true }, // denormalized username for easy querying
  status: { type: String, enum: ["pending", "ready", "in_progress", "completed"], default: "pending" },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);

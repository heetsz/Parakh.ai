import { Schema, model } from "mongoose";

const oaTestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // Quiz Configuration - Use Mixed type for flexibility
  quizConfig: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Quiz Data - Use Mixed type for flexibility
  questions: {
    type: Schema.Types.Mixed,
    default: []
  },
  
  // User Answers - Use Mixed type for flexibility
  answers: {
    type: Schema.Types.Mixed,
    default: []
  },
  
  // Results - Use Mixed type for flexibility
  results: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Metadata
  completedAt: {
    type: Date,
    default: Date.now
  },
  
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  strict: false // Allow flexibility in schema
});

// Index for faster queries
oaTestSchema.index({ user: 1, completedAt: -1 });

const OATest = model("OATest", oaTestSchema);
export default OATest;

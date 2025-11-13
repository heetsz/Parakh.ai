import express from "express";
import { createInterview, listInterviews, getInterview, deleteInterview, saveConversationTurn, completeInterview, uploadAudioFile, upload } from "../controllers/interview-controller.js";
import { protect } from "../middlewares/protect.js";
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Test endpoint to verify Cloudinary config
router.get("/test-cloudinary", protect, async (req, res) => {
  try {
    const config = cloudinary.config();
    res.json({
      configured: !!(config.cloud_name && config.api_key && config.api_secret),
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret_length: config.api_secret?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET / -> list interviews for current user
router.get("/", protect, listInterviews);

// POST / -> create a new interview for current user
router.post("/", protect, createInterview);

// GET /:id -> get interview by id (owner only)
router.get("/:id", protect, getInterview);

// DELETE /:id -> delete interview by id (owner only)
router.delete("/:id", protect, deleteInterview);

// POST /:id/conversation -> save a conversation turn
router.post("/:id/conversation", protect, saveConversationTurn);

// POST /:id/complete -> mark interview as completed
router.post("/:id/complete", protect, completeInterview);

// POST /:id/upload-audio -> upload audio file to Cloudinary
router.post("/:id/upload-audio", protect, upload.single('audio'), uploadAudioFile);

export default router;

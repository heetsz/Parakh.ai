import Interview from "../models/Interview.js";
import User from "../models/User.js";
import { uploadAudio } from "../config/cloudinary.js";
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const createInterview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const foundUser = await User.findById(userId);
    const username = foundUser.username
    if (!userId || !username) return res.status(401).json({ message: "Unauthorized" });

    const {
      role,
      difficulty,
      notes,
    } = req.body;

    // Generate title using simple logic (role + difficulty)
    const title = `${role} - ${difficulty} Interview`;

    const newInterview = new Interview({
      title,
      role: role || "",
      difficulty: difficulty || "",
      notes: notes || "",
      user: userId,
      username,
      status: "pending",
    });

    await newInterview.save();
    
    // Trigger FastAPI to generate interview questions
    const fastapiUrl = process.env.FASTAPI_URL || process.env.AI_HTTP || "http://localhost:8000";
    try {
      const axios = await import('axios').then(m => m.default);
      console.log(`Calling FastAPI at ${fastapiUrl}/interviews/generate`);
      
      const genResp = await axios.post(`${fastapiUrl}/interviews/generate`, {
        title: newInterview.title,
        role: newInterview.role,
        difficulty: newInterview.difficulty,
        notes: newInterview.notes,
      }, {
        timeout: 30000 // 30 second timeout
      });

      if (genResp?.data?.ok && genResp.data.generated) {
        newInterview.result = genResp.data.generated;
        newInterview.status = 'ready';
        newInterview.updatedAt = new Date();
        await newInterview.save();
        console.log('Interview questions generated successfully');
      } else {
        console.warn('FastAPI did not return expected data:', genResp?.data);
      }
    } catch (e) {
      console.error('FastAPI generate failed:', e?.message || e);
      // Interview is still saved, but without generated questions
      // Status remains 'pending'
    }

    return res.status(201).json(newInterview);
  } catch (err) {
    console.error("createInterview error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listInterviews = async (req, res) => {
  try {
    const userId = req.user?._id;
    const foundUser = await User.findById(userId);
    const username = foundUser.username
    if (!username) return res.status(401).json({ message: "Unauthorized" });

    const items = await Interview.find({ username }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(items);
  } catch (err) {
    console.error("listInterviews error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getInterview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const foundUser = await User.findById(userId);
    const username = foundUser.username
    if (!userId || !username) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const iv = await Interview.findById(id).lean();
    if (!iv) return res.status(404).json({ message: "Interview not found" });
    // allow owner by id or matching username
    if (iv.user && iv.user.toString() !== userId.toString() && iv.username !== username) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(iv);
  } catch (err) {
    console.error("getInterview error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const username = req.user?.username;
    if (!userId || !username) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const interview = await Interview.findById(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== userId.toString() && interview.username !== username) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own interviews" });
    }

    await Interview.findByIdAndDelete(id);
    
    return res.status(200).json({ message: "Interview deleted successfully" });
  } catch (err) {
    console.error("deleteInterview error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const saveConversationTurn = async (req, res) => {
  try {
    console.log('💾 Save conversation turn request received');
    
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { speaker, text, audioUrl } = req.body;

    console.log(`   Interview ID: ${id}`);
    console.log(`   Speaker: ${speaker}`);
    console.log(`   Text length: ${text?.length || 0} chars`);
    console.log(`   Audio URL: ${audioUrl || 'none'}`);

    if (!speaker || !text) {
      return res.status(400).json({ message: "Speaker and text are required" });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      console.log('❌ Interview not found');
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== userId.toString()) {
      console.log('❌ User does not own this interview');
      return res.status(403).json({ message: "Forbidden" });
    }

    // Add conversation turn
    interview.conversation.push({
      speaker,
      text,
      audioUrl: audioUrl || null,
      timestamp: new Date()
    });

    console.log(`✅ Conversation turn added. Total turns: ${interview.conversation.length}`);

    // Update status to in_progress if it's the first turn
    if (interview.status === "ready" || interview.status === "pending") {
      interview.status = "in_progress";
      interview.startedAt = new Date();
      console.log('   Status updated to in_progress');
    }

    interview.updatedAt = new Date();
    await interview.save();

    console.log('✅ Interview saved successfully');

    return res.status(200).json({ 
      message: "Conversation turn saved",
      conversation: interview.conversation 
    });
  } catch (err) {
    console.error("❌ saveConversationTurn error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { evaluation } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    interview.status = "completed";
    interview.completedAt = new Date();
    interview.updatedAt = new Date();
    
    if (evaluation) {
      interview.result = { ...interview.result, evaluation };
    }

    await interview.save();

    return res.status(200).json({ 
      message: "Interview completed",
      interview 
    });
  } catch (err) {
    console.error("completeInterview error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const uploadAudioFile = async (req, res) => {
  try {
    console.log('📥 Audio upload request received');
    
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ message: "No audio file provided" });
    }

    const { id } = req.params;
    const { speaker } = req.body; // 'user' or 'ai'
    
    console.log(`   Interview ID: ${id}`);
    console.log(`   Speaker: ${speaker}`);
    console.log(`   File size: ${req.file.size} bytes`);
    console.log(`   File mimetype: ${req.file.mimetype}`);

    // Verify interview exists and user owns it
    const interview = await Interview.findById(id);
    if (!interview) {
      console.log('❌ Interview not found');
      return res.status(404).json({ message: "Interview not found" });
    }
    if (interview.user.toString() !== userId.toString()) {
      console.log('❌ User does not own this interview');
      return res.status(403).json({ message: "Forbidden" });
    }

    // Upload to Cloudinary
    const filename = `${id}_${speaker}_${Date.now()}`;
    const audioUrl = await uploadAudio(req.file.buffer, filename);

    console.log(`✅ Audio upload complete: ${audioUrl}`);

    return res.status(200).json({ 
      message: "Audio uploaded successfully",
      audioUrl 
    });
  } catch (err) {
    console.error("❌ uploadAudioFile error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

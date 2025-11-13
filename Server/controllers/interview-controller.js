import Interview from "../models/Interview.js";
import User from "../models/User.js";
import { uploadAudio } from "../config/cloudinary.js";
import multer from 'multer';
import axios from 'axios';

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

    // Generate title using FastAPI LLM
    const fastapiUrl = process.env.FASTAPI_URL || process.env.AI_HTTP || "http://localhost:8000";
    let title = `${role} - ${difficulty} Interview`; // Fallback title
    
    try {
      console.log('🎯 Generating interview title with LLM...');
      const titleResp = await axios.post(`${fastapiUrl}/interviews/generate-title`, {
        role,
        difficulty,
        notes: notes || ""
      });
      
      if (titleResp.data.ok && titleResp.data.title) {
        title = titleResp.data.title;
        console.log(`✅ Generated title: "${title}"`);
      } else {
        console.log('⚠️ Using fallback title');
      }
    } catch (titleError) {
      console.error('❌ Title generation failed, using fallback:', titleError.message);
    }

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
    try {
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
    console.log('🏁 Complete interview request received');
    
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

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

    console.log('📊 Calling FastAPI to evaluate interview...');
    
    // Call FastAPI to get detailed evaluation
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    
    // Format conversation for evaluation
    const conversation = interview.conversation.map(turn => ({
      role: turn.speaker === 'user' ? 'user' : 'assistant',
      content: turn.text
    }));
    
    const interviewContext = {
      role: interview.role,
      difficulty: interview.difficulty,
      notes: interview.notes
    };
    
    try {
      const evalResponse = await axios.post(
        `${fastApiUrl}/interviews/evaluate`,
        {
          conversation,
          interviewContext
        }
      );
      
      if (evalResponse.data.ok && evalResponse.data.evaluation) {
        const evaluation = evalResponse.data.evaluation;
        
        console.log('✅ Evaluation received:', evaluation);
        
        // Save scores and feedback
        interview.scores = evaluation.scores;
        interview.feedback = evaluation.feedback;
        interview.result = { evaluation: evaluation.feedback.detailedFeedback };
      } else {
        console.log('⚠️ Evaluation failed, using default scores');
      }
    } catch (evalError) {
      console.error('❌ FastAPI evaluation error:', evalError.message);
      // Continue without evaluation rather than failing
    }

    interview.status = "completed";
    interview.completedAt = new Date();
    interview.updatedAt = new Date();

    await interview.save();

    console.log('✅ Interview completed successfully');

    return res.status(200).json({ 
      message: "Interview completed",
      interview 
    });
  } catch (err) {
    console.error("❌ completeInterview error:", err);
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

export const getProgressAnalytics = async (req, res) => {
  try {
    console.log('📊 Progress analytics request received');
    
    const userId = req.user?._id;
    const foundUser = await User.findById(userId);
    const username = foundUser.username;
    
    if (!userId || !username) return res.status(401).json({ message: "Unauthorized" });

    // Get all completed interviews for the user, sorted by completion date
    const interviews = await Interview.find({
      username,
      status: "completed",
      "scores.overall": { $exists: true, $ne: null }
    })
    .sort({ completedAt: 1 })
    .lean();

    if (interviews.length === 0) {
      return res.status(200).json({
        totalInterviews: 0,
        averageScore: 0,
        improvement: 0,
        timeline: [],
        categoryScores: {},
        strengths: [],
        weaknesses: [],
        nextFocusAreas: []
      });
    }

    // Calculate timeline data (for line chart)
    const timeline = interviews.map((interview, index) => ({
      date: interview.completedAt,
      role: interview.role,
      difficulty: interview.difficulty,
      overallScore: interview.scores.overall,
      interviewNumber: index + 1,
      id: interview._id
    }));

    // Calculate average scores per category
    const categoryScores = {
      communication: 0,
      technicalSkills: 0,
      problemSolving: 0,
      confidence: 0,
      clarity: 0
    };

    interviews.forEach(interview => {
      Object.keys(categoryScores).forEach(key => {
        categoryScores[key] += interview.scores[key] || 0;
      });
    });

    Object.keys(categoryScores).forEach(key => {
      categoryScores[key] = Math.round(categoryScores[key] / interviews.length);
    });

    // Calculate improvement (first vs last 3 interviews)
    const firstScore = interviews[0].scores.overall;
    const recentInterviews = interviews.slice(-3);
    const recentAverage = Math.round(
      recentInterviews.reduce((sum, iv) => sum + iv.scores.overall, 0) / recentInterviews.length
    );
    const improvement = recentAverage - firstScore;

    // Aggregate strengths and weaknesses
    const strengthsMap = {};
    const weaknessesMap = {};
    const focusAreasMap = {};

    interviews.forEach(interview => {
      if (interview.feedback) {
        (interview.feedback.strengths || []).forEach(s => {
          strengthsMap[s] = (strengthsMap[s] || 0) + 1;
        });
        (interview.feedback.weaknesses || []).forEach(w => {
          weaknessesMap[w] = (weaknessesMap[w] || 0) + 1;
        });
        (interview.feedback.nextFocusAreas || []).forEach(f => {
          focusAreasMap[f] = (focusAreasMap[f] || 0) + 1;
        });
      }
    });

    // Get top 5 strengths, weaknesses, and focus areas
    const strengths = Object.entries(strengthsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }));

    const weaknesses = Object.entries(weaknessesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }));

    const nextFocusAreas = Object.entries(focusAreasMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }));

    console.log(`✅ Analytics generated for ${interviews.length} interviews`);

    return res.status(200).json({
      totalInterviews: interviews.length,
      averageScore: recentAverage,
      improvement,
      timeline,
      categoryScores,
      strengths,
      weaknesses,
      nextFocusAreas
    });
  } catch (err) {
    console.error("❌ getProgressAnalytics error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

import Interview from "../models/Interview.js";
import User from "../models/User.js";

export const createInterview = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const username = req.user?.username;
    if (!userId || !username) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      role,
      experience,
      type,
      difficulty,
      resume,
      notes,
    } = req.body;

    const newInterview = new Interview({
      title: title || "",
      role: role || "",
      experience: experience || "",
      type: type || "",
      difficulty: difficulty || "",
      resume: resume || "",
      notes: notes || "",
      user: userId,
      username,
      status: "pending",
    });

    await newInterview.save();
    // Trigger FastAPI to prepare an interview generation job here, if configured
    const fastapiUrl = process.env.FASTAPI_URL || process.env.AI_HTTP || "http://localhost:8000";
    try {
      // Fire-and-forget: attempt to generate a plan and store it in the interview.result
      const axios = await import('axios').then(m => m.default);
      const genResp = await axios.post(`${fastapiUrl}/interviews/generate`, {
        title: newInterview.title,
        role: newInterview.role,
        experience: newInterview.experience,
        type: newInterview.type,
        difficulty: newInterview.difficulty,
        resume: newInterview.resume,
        notes: newInterview.notes,
      });

      if (genResp?.data?.ok && genResp.data.generated) {
        newInterview.result = genResp.data.generated;
        newInterview.status = 'ready';
        newInterview.updatedAt = new Date();
        await newInterview.save();
      }
    } catch (e) {
      console.warn('FastAPI generate failed:', e?.message || e);
    }

    return res.status(201).json(newInterview);
  } catch (err) {
    console.error("createInterview error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listInterviews = async (req, res) => {
  try {
    const username = req.user?.username;
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
    const userId = req.user?.userId;
    const username = req.user?.username;
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

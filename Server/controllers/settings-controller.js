import bcrypt from "bcryptjs";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Interview from "../models/Interview.js";

// Multer in-memory storage for image upload
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "Image file is required (field: image)" });

    // Upload to Cloudinary as image
    const buffer = req.file.buffer;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "avatars",
          transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { image: result.secure_url },
      { new: true }
    );
    return res.status(200).json({ message: "Avatar updated", image: user.image });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const changeEmail = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { email } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!email) return res.status(400).json({ message: "New email is required" });

    const exists = await User.findOne({ email });
    if (exists && String(exists._id) !== String(userId)) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const user = await User.findByIdAndUpdate(userId, { email }, { new: true });
    return res.status(200).json({ message: "Email updated", email: user.email });
  } catch (err) {
    console.error("changeEmail error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listAiModels = async (_req, res) => {
  try {
    // Curated interviewer models using Liara avatar generator.
    // Each model maps to a unique avatar number.
    const base = "https://avatar.iran.liara.run/public";
    const models = [
      { name: "Arista-PlayAI", image: `${base}/23` },
      { name: "Atlas-PlayAI", image: `${base}/24` },
      { name: "Basil-PlayAI", image: `${base}/25` },
      { name: "Briggs-PlayAI", image: `${base}/26` },
      { name: "Calum-PlayAI", image: `${base}/27` },
      { name: "Celeste-PlayAI", image: `${base}/28` },
      { name: "Cheyenne-PlayAI", image: `${base}/29` },
      { name: "Chip-PlayAI", image: `${base}/30` },
      { name: "Cillian-PlayAI", image: `${base}/31` },
      { name: "Deedee-PlayAI", image: `${base}/32` },
      { name: "Fritz-PlayAI", image: `${base}/33` },
      { name: "Gail-PlayAI", image: `${base}/34` },
      { name: "Indigo-PlayAI", image: `${base}/35` },
      { name: "Mamaw-PlayAI", image: `${base}/36` },
      { name: "Mason-PlayAI", image: `${base}/37` },
      { name: "Mikail-PlayAI", image: `${base}/38` },
      { name: "Mitch-PlayAI", image: `${base}/39` },
      { name: "Quinn-PlayAI", image: `${base}/40` },
      { name: "Thunder-PlayAI", image: `${base}/41` },
    ];
    return res.status(200).json(models);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const setAiModel = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { name, image } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name) return res.status(400).json({ message: "Model name required" });

    const user = await User.findByIdAndUpdate(
      userId,
      { aiModelName: name, aiModelImage: image || "" },
      { new: true }
    );
    return res.status(200).json({ message: "AI model updated", aiModelName: user.aiModelName, aiModelImage: user.aiModelImage });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Change display name
export const changeName = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { name } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(userId, { name: name.trim() }, { new: true });
    return res.status(200).json({ message: "Name updated", name: user.name });
  } catch (err) {
    console.error("changeName error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete account (and user-generated content)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Remove user's posts
    await Post.deleteMany({ author: userId });
    // Remove user's likes and comments from other posts
    await Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );
    await Post.updateMany(
      { 'comments.author': userId },
      { $pull: { comments: { author: userId } } }
    );

    // Remove user's interviews
    await Interview.deleteMany({ user: userId });

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    // Clear auth cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieClearOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };
    res.clearCookie('token', cookieClearOptions);

    return res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

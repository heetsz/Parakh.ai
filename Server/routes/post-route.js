import express from "express";
import { protect } from "../middlewares/protect.js";
import {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  deletePost
} from "../controllers/post-controller.js";

const router = express.Router();

router.post("/posts", protect, createPost);
router.get("/posts", protect, getAllPosts);
router.put("/posts/:postId/like", protect, likePost);
router.post("/posts/:postId/comment", protect, addComment);
router.delete("/posts/:postId", protect, deletePost);

export default router;

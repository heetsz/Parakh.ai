import express from "express";
import { createInterview, listInterviews, getInterview } from "../controllers/interview-controller.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

// GET / -> list interviews for current user
router.get("/", protect, listInterviews);

// POST / -> create a new interview for current user
router.post("/", protect, createInterview);

// GET /:id -> get interview by id (owner only)
router.get("/:id", protect, getInterview);

export default router;

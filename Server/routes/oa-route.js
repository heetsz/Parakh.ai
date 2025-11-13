import express from "express";
import { protect } from "../middlewares/protect.js";
import { generateQuiz, submitQuizResults } from "../controllers/oa-controller.js";

const router = express.Router();

router.post("/generate", protect, generateQuiz);
router.post("/submit", protect, submitQuizResults);

export default router;

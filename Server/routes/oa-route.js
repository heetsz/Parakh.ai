import express from "express";
import { protect } from "../middlewares/protect.js";
import { 
  generateQuiz, 
  submitQuizResults, 
  getOAHistory, 
  getOATestDetails,
  getOAStats 
} from "../controllers/oa-controller.js";

const router = express.Router();

router.post("/generate", protect, generateQuiz);
router.post("/submit", protect, submitQuizResults);
router.get("/history", protect, getOAHistory);
router.get("/stats", protect, getOAStats);
router.get("/test/:testId", protect, getOATestDetails);

export default router;

import express from "express";
import { protect } from "../middlewares/protect.js";
import { getProfile, redeemItem } from "../controllers/gamification-controller.js";

const router = express.Router();

// ✅ Only 2 endpoints needed now
router.get("/profile", protect, getProfile);
router.post("/redeem", protect, redeemItem);

export default router;

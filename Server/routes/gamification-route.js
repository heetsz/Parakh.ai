import express from "express";
import {protect} from "../middlewares/protect.js";
import {
      addCoins,
      getProfile,
      redeemItem,
} from "../controllers/gamification-controller.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.post("/add-coins", protect, addCoins);
router.post("/redeem", protect, redeemItem);

export default router;

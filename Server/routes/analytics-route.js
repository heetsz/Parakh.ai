import express from "express";
import { getSummary } from "../controllers/analytics-controller.js";
import { protect } from "../middlewares/protect.js";

const analyticsRouter = express.Router();

analyticsRouter.get('/analytics/summary', protect, getSummary);

export default analyticsRouter;

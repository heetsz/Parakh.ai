import express from "express";
import { registration, login, logout, getProfile, verifyEmailCode } from "../controllers/auth-controller.js";
import { protect } from "../middlewares/protect.js";

const authRouter = express.Router();

authRouter.post('/register', registration);
authRouter.post('/verify', verifyEmailCode);
authRouter.post('/login', login);
authRouter.post('/logout', protect, logout);
authRouter.get('/me', protect, getProfile);

export default authRouter;
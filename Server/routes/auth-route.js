import express from "express";
import { userRegistration, userLogin, userLogout, getProfile } from "../controllers/user-controller.js";
import { protect } from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post('/register', userRegistration);
authRouter.post('/login', userLogin);
authRouter.post('/logout', protect, userLogout);
authRouter.get('/me', protect, getProfile);

export default authRouter;

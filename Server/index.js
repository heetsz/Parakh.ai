import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/db.js";
import authRouter from "./routes/auth-route.js";
import mailRouter from "./routes/mail-route.js";
import gamificationRoutes from "./routes/gamification-route.js";
import interviewRoutes from "./routes/interview-route.js";
import postRouter from "./routes/post-route.js";


dotenv.config();
const app = express();

// Behind Render/other proxies, this ensures secure cookies work correctly
app.set('trust proxy', 1);
app.use(express.json());

app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
}));

app.use(cookieParser());

app.use('/api', authRouter);
app.use('/api', mailRouter);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/community', postRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
      console.log(`Server running`);
      await db();
});

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

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://parakh-ai.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000',
].filter(Boolean); // Remove undefined values

app.use(cors({
      origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                  callback(null, true);
            } else {
                  callback(new Error('Not allowed by CORS'));
            }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
}));

app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', authRouter);
app.use('/api', mailRouter);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/community', postRouter);

// Error handling middleware
app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
});

// 404 handler
app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
      console.log(`Server running`);
      await db();
});

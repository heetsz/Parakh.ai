import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/db.js";
import authRouter from "./routes/auth-route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
      origin: process.env.FRONTEND_URL, 
      credentials: true,                 
}));
app.use(cookieParser());

app.use('/api', authRouter); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
      console.log(`Server running on http://localhost:${PORT}/api/`);
      await db();
});

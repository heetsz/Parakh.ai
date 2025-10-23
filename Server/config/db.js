import mongoose from "mongoose";

const db = async () => {
      try {
            await mongoose.connect(process.env.DB_URI);
            console.log("MongoDB connected at ", process.env.DB_URI);
      } catch (err) {
            console.error("Database connection failed:", err.message);
      }
};

export default db;

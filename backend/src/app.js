import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.FRONTEND_DOMAIN,
  process.env.FRONTEND_WWW_DOMAIN,
  process.env.ADMIN_DOMAIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic Lambda health check - no DB needed
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ODMM Serverless Backend Running",
  });
});

// DB status check
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    res.json({
      success: true,
      message: "MongoDB connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
    });
  }
});

// DB middleware only for API routes below this
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/locations", locationRoutes);

export default app;
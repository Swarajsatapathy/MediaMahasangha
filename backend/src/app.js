import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import memberNewsChannelRoutes from "./routes/memberNewsChannelRoutes.js";
import srbMemberRoutes from "./routes/srbMemberRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",

  "https://media-mahasangha-frontend.vercel.app",
  "https://media-mahasangha-adminpage.vercel.app",

  "https://mediamahasangha.in",
  "https://www.mediamahasangha.in",
  "https://admin.mediamahasangha.in",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log("Request Origin:", origin);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

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
app.use("/api/mentors", mentorRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/member-news-channels", memberNewsChannelRoutes);
app.use("/api/srb-members", srbMemberRoutes);

export default app;
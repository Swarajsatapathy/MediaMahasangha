import express from "express";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getFeaturedVideos,
  getFlashVideos,
} from "../controllers/videoController.js";

const router = express.Router();

router.post("/", protectAdmin, createVideo);
router.get("/", getVideos);

router.get("/featured", getFeaturedVideos);
router.get("/flash", getFlashVideos);

router.get("/:id", getVideoById);
router.put("/:id", protectAdmin, updateVideo);
router.delete("/:id", protectAdmin, deleteVideo);

export default router;
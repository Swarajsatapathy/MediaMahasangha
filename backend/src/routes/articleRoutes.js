import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getFlashStories,
  getEditorsPicks,
  getTrendingStories,
  getFeaturedStories,
} from "../controllers/articleController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.array("images", 5), createArticle);
router.get("/", getArticles);

router.get("/flash", getFlashStories);
router.get("/editors-picks", getEditorsPicks);
router.get("/trending", getTrendingStories);
router.get("/featured", getFeaturedStories);

router.get("/:id", getArticleById);
router.put("/:id", protectAdmin, upload.array("images", 5), updateArticle);
router.delete("/:id", protectAdmin, deleteArticle);

export default router;
import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
} from "../controllers/galleryController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createGalleryItem);
router.get("/", getGalleryItems);
router.get("/:id", getGalleryItemById);
router.put("/:id", protectAdmin, upload.single("photo"), updateGalleryItem);
router.delete("/:id", protectAdmin, deleteGalleryItem);

export default router;
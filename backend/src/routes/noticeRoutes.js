import express from "express";
import pdfUpload from "../middlewares/pdfUpload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../controllers/noticeController.js";

const router = express.Router();

router.post("/", protectAdmin, pdfUpload.single("pdf"), createNotice);
router.get("/", getNotices);
router.get("/:id", getNoticeById);
router.put("/:id", protectAdmin, pdfUpload.single("pdf"), updateNotice);
router.delete("/:id", protectAdmin, deleteNotice);

export default router;

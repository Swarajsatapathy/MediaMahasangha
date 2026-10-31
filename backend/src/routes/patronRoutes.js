import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createPatron,
  getPatrons,
  getPatronById,
  updatePatron,
  deletePatron,
} from "../controllers/patronController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createPatron);
router.get("/", getPatrons);
router.get("/:id", getPatronById);
router.put("/:id", protectAdmin, upload.single("photo"), updatePatron);
router.delete("/:id", protectAdmin, deletePatron);

export default router;


import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  deleteMentor,
} from "../controllers/mentorController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createMentor);
router.get("/", getMentors);
router.get("/:id", getMentorById);
router.put("/:id", protectAdmin, upload.single("photo"), updateMentor);
router.delete("/:id", protectAdmin, deleteMentor);

export default router;
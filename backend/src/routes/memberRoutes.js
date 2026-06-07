import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createMember);
router.get("/", getMembers);
router.get("/:id", getMemberById);
router.put("/:id", protectAdmin, upload.single("photo"), updateMember);
router.delete("/:id", protectAdmin, deleteMember);

export default router;
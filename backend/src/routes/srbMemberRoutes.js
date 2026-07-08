import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createSrbMember,
  getSrbMembers,
  getSrbMemberById,
  updateSrbMember,
  deleteSrbMember,
} from "../controllers/srbMemberController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createSrbMember);
router.get("/", getSrbMembers);
router.get("/:id", getSrbMemberById);
router.put("/:id", protectAdmin, upload.single("photo"), updateSrbMember);
router.delete("/:id", protectAdmin, deleteSrbMember);

export default router;
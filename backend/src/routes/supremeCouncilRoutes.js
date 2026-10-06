import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createSupremeCouncilMember,
  getSupremeCouncilMembers,
  getSupremeCouncilMemberById,
  updateSupremeCouncilMember,
  deleteSupremeCouncilMember,
} from "../controllers/supremeCouncilController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createSupremeCouncilMember);
router.get("/", getSupremeCouncilMembers);
router.get("/:id", getSupremeCouncilMemberById);
router.put("/:id", protectAdmin, upload.single("photo"), updateSupremeCouncilMember);
router.delete("/:id", protectAdmin, deleteSupremeCouncilMember);

export default router;

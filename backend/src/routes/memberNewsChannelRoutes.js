import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createMemberNewsChannel,
  getMemberNewsChannels,
  getMemberNewsChannelById,
  updateMemberNewsChannel,
  deleteMemberNewsChannel,
} from "../controllers/memberNewsChannelController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createMemberNewsChannel);
router.get("/", getMemberNewsChannels);
router.get("/:id", getMemberNewsChannelById);
router.put("/:id", protectAdmin, upload.single("photo"), updateMemberNewsChannel);
router.delete("/:id", protectAdmin, deleteMemberNewsChannel);

export default router;
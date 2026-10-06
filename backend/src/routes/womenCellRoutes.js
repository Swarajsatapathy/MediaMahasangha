import express from "express";
import upload from "../middlewares/upload.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

import {
  createWomenCellMember,
  getWomenCellMembers,
  getWomenCellMemberById,
  updateWomenCellMember,
  deleteWomenCellMember,
} from "../controllers/womenCellController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("photo"), createWomenCellMember);
router.get("/", getWomenCellMembers);
router.get("/:id", getWomenCellMemberById);
router.put("/:id", protectAdmin, upload.single("photo"), updateWomenCellMember);
router.delete("/:id", protectAdmin, deleteWomenCellMember);

export default router;

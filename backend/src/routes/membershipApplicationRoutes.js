import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationById,
  verifyPayment,
  rejectPayment,
  approveApplication,
  rejectApplication,
  getCreateMemberData,
} from "../controllers/membershipApplicationController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public route to submit an application
router.post("/", upload.single("photo"), createApplication);

// Admin routes
router.get("/", protectAdmin, getApplications);
router.get("/:id", protectAdmin, getApplicationById);

router.patch("/:id/verify-payment", protectAdmin, verifyPayment);
router.patch("/:id/reject-payment", protectAdmin, rejectPayment);
router.patch("/:id/approve", protectAdmin, approveApplication);
router.patch("/:id/reject", protectAdmin, rejectApplication);

router.get("/:id/create-member-data", protectAdmin, getCreateMemberData);

export default router;

import express from "express";
import DISTRICTS from "../constants/districts.js";

const router = express.Router();

router.get("/districts", (req, res) => {
  res.status(200).json({
    success: true,
    count: DISTRICTS.length,
    data: DISTRICTS,
  });
});

export default router;
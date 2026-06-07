import express from "express";
import upload from "../middlewares/upload.js";
import { uploadToS3 } from "../utils/s3Upload.js";

const router = express.Router();

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const result = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "test"
    );

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
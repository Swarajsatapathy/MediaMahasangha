import mongoose from "mongoose";
import DISTRICTS, {
  ALL_VALID_DISTRICTS,
  normalizeDistrict,
} from "../constants/districts.js";

const gallerySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      enum: ALL_VALID_DISTRICTS,
      set: normalizeDistrict,
      trim: true,
    },

    photo: {
      url: {
        type: String,
        default: "",
      },
      key: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ createdAt: -1 });
gallerySchema.index({ district: 1, createdAt: -1 });

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
import mongoose from "mongoose";
import DISTRICTS from "../constants/districts.js";

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
      enum: DISTRICTS,
      trim: true,
    },

    area: {
      type: String,
      required: true,
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

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
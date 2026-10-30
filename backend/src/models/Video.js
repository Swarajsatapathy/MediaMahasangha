import mongoose from "mongoose";
import DISTRICTS, {
  ALL_VALID_DISTRICTS,
  normalizeDistrict,
} from "../constants/districts.js";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },

    youtubeId: {
      type: String,
      default: "",
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    district: {
      type: String,
      required: true,
      enum: ALL_VALID_DISTRICTS,
      set: normalizeDistrict,
      trim: true,
    },

    reporter: {
      type: String,
      default: "Admin",
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isFlash: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
     default: false,
    },

    isEditorsPick: {
      type: Boolean,
     default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.index({ isPublished: 1, isFlash: 1, publishedAt: -1 });
videoSchema.index({ isPublished: 1, isFeatured: 1, publishedAt: -1 });
videoSchema.index({ isPublished: 1, isTrending: 1, views: -1 });
videoSchema.index({ isPublished: 1, isEditorsPick: 1, publishedAt: -1 });
videoSchema.index({ isPublished: 1, publishedAt: -1 });
videoSchema.index({ district: 1, isPublished: 1, publishedAt: -1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;
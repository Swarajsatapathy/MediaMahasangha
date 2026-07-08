import mongoose from "mongoose";
import DISTRICTS from "../constants/districts.js";

const memberNewsChannelSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },

    odmmRegistrationNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    newsChannelName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
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

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      default: "",
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MemberNewsChannel = mongoose.model(
  "MemberNewsChannel",
  memberNewsChannelSchema
);

export default MemberNewsChannel;
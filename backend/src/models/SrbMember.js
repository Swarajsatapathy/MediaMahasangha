import mongoose from "mongoose";
import DISTRICTS, {
  ALL_VALID_DISTRICTS,
  normalizeDistrict,
} from "../constants/districts.js";

const srbMemberSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
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

    mobileNumber: {
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SrbMember = mongoose.model("SrbMember", srbMemberSchema);

export default SrbMember;
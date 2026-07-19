import mongoose from "mongoose";
import DISTRICTS from "../constants/districts.js";

const memberSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },

    memberId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      enum: DISTRICTS,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Date until which the ODMM membership remains valid
    validUpto: {
      type: Date,
      required: true,
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

    // Manual control from admin panel
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/*
  Computed membership status.

  A member is valid only when:
  1. isActive is true
  2. validUpto has not passed
*/
memberSchema.virtual("membershipStatus").get(function () {
  if (!this.isActive) {
    return "Inactive";
  }

  if (!this.validUpto) {
    return "Validity not set";
  }

  const today = new Date();
  const validUpto = new Date(this.validUpto);

  today.setHours(0, 0, 0, 0);
  validUpto.setHours(23, 59, 59, 999);

  return validUpto >= today ? "Valid" : "Expired";
});

memberSchema.virtual("isMembershipValid").get(function () {
  if (!this.isActive || !this.validUpto) {
    return false;
  }

  const today = new Date();
  const validUpto = new Date(this.validUpto);

  today.setHours(0, 0, 0, 0);
  validUpto.setHours(23, 59, 59, 999);

  return validUpto >= today;
});

const Member = mongoose.model("Member", memberSchema);

export default Member;
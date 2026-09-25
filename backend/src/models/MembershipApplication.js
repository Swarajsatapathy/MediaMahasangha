import mongoose from "mongoose";
import DISTRICTS from "../constants/districts.js";

const membershipApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
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
    dateOfBirth: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappSameAsMobile: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
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
    blockOrNac: {
      type: String,
      required: true,
      trim: true,
    },
    policeStation: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    newsAgencyName: {
      type: String,
      required: true,
      trim: true,
    },
    nomineeName: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      url: {
        type: String,
        required: true,
      },
      key: {
        type: String,
        required: true,
      },
    },
    declarationAccepted: {
      type: Boolean,
      required: true,
    },
    declarationAcceptedAt: {
      type: Date,
    },
    paymentAmount: {
      type: Number,
      required: true,
      default: 300,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentUtr: {
      type: String,
      required: true,
      trim: true,
    },
    paymentConfirmationAccepted: {
      type: Boolean,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "REJECTED"],
      default: "PENDING_VERIFICATION",
    },
    paymentVerificationRemarks: {
      type: String,
      trim: true,
    },
    paymentVerifiedAt: {
      type: Date,
    },
    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    applicationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    adminRemarks: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    memberCreated: {
      type: Boolean,
      default: false,
    },
    memberId: {
      type: String,
      trim: true,
    },
    createdMemberRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  {
    timestamps: true,
  }
);

const MembershipApplication = mongoose.model(
  "MembershipApplication",
  membershipApplicationSchema
);

export default MembershipApplication;

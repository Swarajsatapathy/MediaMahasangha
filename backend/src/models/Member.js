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

    /*
      Member's normal/home district.
      This field already exists and remains unchanged.
    */
    district: {
      type: String,
      required: true,
      enum: DISTRICTS,
      trim: true,
    },

    /*
      Committee to which the member belongs.

      null is temporarily permitted so that old members already
      present in MongoDB continue working until the admin assigns
      their committee.
    */
    committeeType: {
      type: String,
      enum: {
        values: ["state", "district", null],
        message: "Committee type must be state or district",
      },
      default: null,
    },

    /*
      Required only when committeeType is district.

      Stored value:
      "Angul"

      Frontend label:
      "Angul District Committee"
    */
    committeeDistrict: {
      type: String,
      enum: {
        values: ["", ...DISTRICTS],
        message: "Invalid committee district",
      },
      default: "",
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
  Committee validation:

  State members must not have a committeeDistrict.

  District members must have a valid committeeDistrict.
*/
memberSchema.pre("validate", function () {
  if (this.committeeType === "state") {
    this.committeeDistrict = "";
  }

  if (
    this.committeeType === "district" &&
    !this.committeeDistrict
  ) {
    this.invalidate(
      "committeeDistrict",
      "Committee district is required for a district committee member"
    );
  }
});

/*
  Helps MongoDB filter committee members efficiently.
*/
memberSchema.index({
  committeeType: 1,
  committeeDistrict: 1,
  serialNumber: 1,
});

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
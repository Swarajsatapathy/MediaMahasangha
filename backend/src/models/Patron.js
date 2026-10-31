import mongoose from "mongoose";

const patronSchema = new mongoose.Schema(
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

    // Primary designation / First designation
    designation: {
      type: String,
      required: true,
      trim: true,
    },

    // Second designation (optional)
    designation2: {
      type: String,
      default: "",
      trim: true,
    },

    // Area / Region / Location
    area: {
      type: String,
      default: "",
      trim: true,
    },

    // District (mirrored/synced with area for filtering compatibility)
    district: {
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

patronSchema.index({ isActive: 1, serialNumber: 1 });
patronSchema.index({ area: 1, serialNumber: 1 });
patronSchema.index({ district: 1, serialNumber: 1 });

export default mongoose.model("Patron", patronSchema);


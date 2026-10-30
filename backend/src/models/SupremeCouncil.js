import mongoose from "mongoose";

const supremeCouncilSchema = new mongoose.Schema(
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

supremeCouncilSchema.index({ isActive: 1, serialNumber: 1 });
supremeCouncilSchema.index({ district: 1, serialNumber: 1 });

export default mongoose.model("SupremeCouncil", supremeCouncilSchema);

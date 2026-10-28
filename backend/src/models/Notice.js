import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },

    pdf: {
      url: {
        type: String,
        required: [true, "Notice PDF file URL is required"],
      },
      key: {
        type: String,
        required: [true, "Notice PDF S3 key is required"],
      },
    },

    date: {
      type: Date,
      default: Date.now,
    },

    websiteLink: {
      type: String,
      default: "",
      trim: true,
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

noticeSchema.index({ date: -1 });
noticeSchema.index({ isActive: 1 });

const Notice = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);

export default Notice;

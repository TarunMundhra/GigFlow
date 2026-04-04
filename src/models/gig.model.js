import mongoose, { Schema } from "mongoose";

const gigSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    status: {
      type: String,
      enum: ["open", "assigned"],
      default: "open",
    },
  },
  { timestamps: true },
);

export const Gig = mongoose.model("Gig", gigSchema);

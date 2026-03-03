import { Schema, model, Types } from "mongoose";
import { ref } from "node:process";

const followSchema = new Schema(
  {
    followerId: {
      type: Types.ObjectId,
      required: true,
      index: true,
      ref: "User"
    },
    followingId: {
      type: Types.ObjectId,
      required: true,
      index: true,
      ref: "User"
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate follows
followSchema.index(
  { followerId: 1, followingId: 1 },
  { unique: true }
);

export const Follow = model("Follow", followSchema);

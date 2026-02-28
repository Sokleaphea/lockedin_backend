import { Schema, model, Types } from "mongoose";

const privateChatSchema = new Schema(
  {
    members: {
      type: [Types.ObjectId],
      required: true,
      validate: {
        validator: function (value: Types.ObjectId[]) {
          return value.length === 2;
        },
        message: "Private chat must have exactly 2 members",
      },
    },
  },
  { timestamps: true }
);

// Ensure uniqueness of pair (sorted order stored)
privateChatSchema.index({ members: 1 }, { unique: true });

export const PrivateChat = model("PrivateChat", privateChatSchema);
import { Schema, model, Types } from "mongoose";

const groupChatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    ownerId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },

    memberIds: {
      type: [Types.ObjectId],
      required: true,
      validate: {
        validator: function (value: Types.ObjectId[]) {
          return value.length >= 1;
        },
        message: "Group must have at least one member",
      },
    },
  },
  { timestamps: true }
);

// Index for fast membership lookup
groupChatSchema.index({ memberIds: 1 });

export const GroupChat = model("GroupChat", groupChatSchema);
import { Schema, model, Types } from "mongoose";

export interface IChatSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  status: "planned" | "clarification_required";
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["planned", "clarification_required"],
      default: "planned",
    },
  },
  { timestamps: true }
);

export const ChatSession = model<IChatSession>(
  "ChatSession",
  chatSessionSchema
);

import { Schema, model, Types } from "mongoose";

export interface IChatMessage {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  role: "system" | "user" | "assistant";
  type: "goal" | "breakdown" | "refinement" | "clarification";
  content: string;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["system", "user", "assistant"],
      required: true,
    },
    type: {
      type: String,
      enum: ["goal", "breakdown", "refinement", "clarification"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatMessage = model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema
);

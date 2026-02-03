import { Schema, model } from "mongoose";

export type TodoStatus = "pending" | "completed";

const todoSchema = new Schema(
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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

export const Todo = model("Todo", todoSchema);

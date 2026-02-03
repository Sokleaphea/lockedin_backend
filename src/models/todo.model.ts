import { randomUUID } from "crypto";
import { Schema, model } from "mongoose";

export type TodoStatus = "pending" | "completed";

const todoSchema = new Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      default: () => randomUUID(),
    },
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
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

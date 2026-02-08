// models/flashcardSet.model.ts
import { Schema, model, Types } from "mongoose";

const FlashcardSetSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      index: true, // fast lookup per user
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FlashcardSetModel = model(
  "FlashcardSet",
  FlashcardSetSchema
);

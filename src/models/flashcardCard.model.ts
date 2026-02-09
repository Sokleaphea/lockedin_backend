// models/flashcardCard.model.ts
import { Schema, model, Types } from "mongoose";

const FlashcardCardSchema = new Schema(
  {
    flashcardSetId: {
      type: Types.ObjectId,
      required: true,
      index: true, // fast card lookup per set
    },

    front: {
      type: String,
      required: true,
      trim: true,
    },

    back: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FlashcardCardModel = model(
  "FlashcardCard",
  FlashcardCardSchema
);

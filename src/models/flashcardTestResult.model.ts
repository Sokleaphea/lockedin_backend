// models/flashcardTestResult.model.ts
import { Schema, model, Types } from "mongoose";

const FlashcardTestResultSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      index: true, // per-user history
    },

    flashcardSetId: {
      type: Types.ObjectId,
      required: true,
      index: true, // per-set analytics
    },

    correctCount: {
      type: Number,
      required: true,
      min: 0,
    },

    wrongCount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCards: {
      type: Number,
      required: true,
      min: 1,
    },

    takenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // takenAt already covers this
  }
);

export const FlashcardTestResultModel = model(
  "FlashcardTestResult",
  FlashcardTestResultSchema
);

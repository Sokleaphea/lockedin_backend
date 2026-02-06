import { Schema, model, Types } from "mongoose";

const PomodoroFocusSessionSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    index: true, 
  },

  durationSeconds: {
    type: Number,
    required: true,
    min: 1, 
  },

  completedAt: {
    type: Date,
    required: true,
    index: true, // useful for date-range queries (daily / weekly stats)
  },
});

export const PomodoroFocusSessionModel = model(
  "PomodoroFocusSession",
  PomodoroFocusSessionSchema
);

import { Schema, model, Types } from "mongoose";

const PomodoroFocusSessionSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    index: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1,
  },
  completedAt: {
    type: Date,
    required: true,
    index: true,
  },
});

export const PomodoroFocusSessionModel = model(
  "PomodoroFocusSession",
  PomodoroFocusSessionSchema
);

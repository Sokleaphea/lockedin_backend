import { Schema, model, Types } from "mongoose";

const UserStreakSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    unique: true,
    index: true,
  },

  dailyGoalSeconds: {
    type: Number,
    required: true,
    default: 1800, // 30 min default
  },

  currentStreak: {
    type: Number,
    default: 0,
  },

  longestStreak: {
    type: Number,
    default: 0,
  },

  totalGoalDays: {
    type: Number,
    default: 0,
  },

  lastGoalMetDate: {
    type: Date,
  },

  todayAccumulatedSeconds: {
    type: Number,
    default: 0,
  },

  todayDate: {
    type: Date,
  },
});

export const UserStreakModel = model(
  "UserStreak",
  UserStreakSchema
);
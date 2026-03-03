import { Types } from "mongoose";
import { UserStreakModel } from "../models/userStreak.model";
import { startOfDayUTC7 } from "../utils/dateUTC7";

export async function updateStreakAfterFocus(
  userId: Types.ObjectId,
  durationSeconds: number
) {
  const today = startOfDayUTC7(new Date());

  let streak = await UserStreakModel.findOne({ userId });

  if (!streak) {
    streak = await UserStreakModel.create({
      userId,
      todayDate: today,
    });
  }

  // If new day → reset today's accumulation
  if (!streak.todayDate || streak.todayDate.getTime() !== today.getTime()) {
    streak.todayAccumulatedSeconds = 0;
    streak.todayDate = today;
  }

  streak.todayAccumulatedSeconds += durationSeconds;

  // Check goal
  const goalReached =
    streak.todayAccumulatedSeconds >= streak.dailyGoalSeconds;

  const alreadyCountedToday =
    streak.lastGoalMetDate &&
    streak.lastGoalMetDate.getTime() === today.getTime();

  if (goalReached && !alreadyCountedToday) {
    streak.currentStreak += 1;
    streak.totalGoalDays += 1;
    streak.lastGoalMetDate = today;

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  }

  await streak.save();
}
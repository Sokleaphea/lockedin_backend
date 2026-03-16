import { Types } from "mongoose";
import { UserStreakModel } from "../models/userStreak.model";
import { isSameDayUTC7, startOfDayUTC7, yesterdayUTC7 } from "../utils/dateUTC7";

export async function updateStreakAfterFocus(
  userId: Types.ObjectId,
  durationSeconds: number
) {
  const today = startOfDayUTC7(new Date());
  const yesterday = yesterdayUTC7(new Date());

  let streak = await UserStreakModel.findOne({ userId });

  if (!streak) {
    streak = await UserStreakModel.create({
      userId,
      todayDate: today,
    });
  }

  // If new day → reset today's accumulation
  if (!streak.todayDate || !isSameDayUTC7(streak.todayDate, today)) {
    streak.todayAccumulatedSeconds = 0;
    streak.todayDate = today;
  }

  streak.todayAccumulatedSeconds += durationSeconds;

  // Check goal
  const goalReached =
    streak.todayAccumulatedSeconds >= streak.dailyGoalSeconds;

  const alreadyCountedToday =
    streak.lastGoalMetDate &&
    isSameDayUTC7(streak.lastGoalMetDate, today);

  if (goalReached && !alreadyCountedToday) {
    const metGoalYesterday =
      streak.lastGoalMetDate &&
      startOfDayUTC7(streak.lastGoalMetDate).getTime() === yesterday.getTime();

    streak.currentStreak = metGoalYesterday
      ? streak.currentStreak + 1
      : 1;
    streak.totalGoalDays += 1;
    streak.lastGoalMetDate = today;

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  }

  await streak.save();
}
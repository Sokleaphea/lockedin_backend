import cron from "node-cron";
import { UserStreakModel } from "../models/userStreak.model";
import { startOfDayUTC7, yesterdayUTC7 } from "../utils/dateUTC7";

export function startStreakResetCron() {
  // Runs every day at midnight UTC+7 (5pm UTC)
  cron.schedule("0 17 * * *", async () => {
    const now = new Date();
    const today = startOfDayUTC7(now);
    const yesterday = yesterdayUTC7(now);

    console.log("[StreakCron] Running daily streak reset at", now.toISOString());

    try {
      // 1. Reset todayAccumulatedSeconds for all users whose todayDate is not today
      const accReset = await UserStreakModel.updateMany(
        {
          todayDate: { $lt: today },
        },
        {
          $set: {
            todayAccumulatedSeconds: 0,
            todayDate: today,
          },
        }
      );
      console.log(`[StreakCron] Reset accumulation for ${accReset.modifiedCount} users`);

      // 2. Reset currentStreak for users who missed yesterday's goal
      const streakReset = await UserStreakModel.updateMany(
        {
          $or: [
            { lastGoalMetDate: { $lt: yesterday } },
            { lastGoalMetDate: null },
          ],
          currentStreak: { $gt: 0 },
        },
        {
          $set: { currentStreak: 0 },
        }
      );
      console.log(`[StreakCron] Reset streak for ${streakReset.modifiedCount} users`);

    } catch (err) {
      console.error("[StreakCron] Error during streak reset:", err);
    }
  });

  console.log("[StreakCron] Streak reset cron scheduled");
}
import { Request, Response } from "express";
import { Types } from "mongoose";
import { UserStreakModel } from "../models/userStreak.model";
import { yesterdayUTC7, startOfDayUTC7 } from "../utils/dateUTC7";
import { updateStreakAfterFocus } from "../services/streak.service";


// POST /api/streak/goal
export async function updateDailyGoal(req: Request, res: Response) {
    const userId = new Types.ObjectId(req.user!.id);
    const { dailyGoalSeconds } = req.body;

    if (
        typeof dailyGoalSeconds !== "number" ||
        dailyGoalSeconds <= 0
    ) {
        return res.status(400).json({ message: "Invalid goal" });
    }

    let streak = await UserStreakModel.findOne({ userId });

    if (!streak) {
        streak = await UserStreakModel.create({
            userId,
            dailyGoalSeconds,
        });
    } else {
        streak.dailyGoalSeconds = dailyGoalSeconds;
        await streak.save();
    }

    return res.json({ success: true });
}

// GET /api/streak
export async function getStreak(req: Request, res: Response) {
    const userId = new Types.ObjectId(req.user!.id);
    const now = new Date();
    const yesterday = yesterdayUTC7(now);

    let streak = await UserStreakModel.findOne({ userId });

    if (!streak) {
        streak = await UserStreakModel.create({ userId });
    }

    // Lazy reset
    if (
        streak.lastGoalMetDate &&
        streak.lastGoalMetDate.getTime() < yesterday.getTime()
    ) {
        streak.currentStreak = 0;
        await streak.save();
    }

    console.log("System now:", new Date());
    console.log("Yesterday:", yesterday);
    console.log("LastGoalMet:", streak.lastGoalMetDate);

    return res.json({
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        totalGoalDays: streak.totalGoalDays,
        dailyGoalSeconds: streak.dailyGoalSeconds,
        todayAccumulatedSeconds: streak.todayAccumulatedSeconds,
    });
}

export async function recordFocusTime(req: Request, res: Response) {
    const userId = new Types.ObjectId(req.user!.id);
    const { durationSeconds } = req.body;

    if (
        typeof durationSeconds !== "number" ||
        durationSeconds <= 0
    ) {
        return res.status(400).json({
            message: "Invalid duration",
        });
    }

    try {
        await updateStreakAfterFocus(userId, durationSeconds);

        return res.json({
            success: true,
            message: "Focus time recorded",
        });
    } catch (err) {
        console.error("Streak update failed:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to update streak",
        });
    }
}

export async function startFocusSession(req: Request, res: Response) {
  const userId = new Types.ObjectId(req.user!.id);

  let streak = await UserStreakModel.findOne({ userId });

  if (!streak) {
    streak = await UserStreakModel.create({ userId });
  }

  // Prevent duplicate sessions
  if (streak.sessionStartTime) {
    return res.status(400).json({
      message: "Session already active",
    });
  }

  streak.sessionStartTime = new Date();
  await streak.save();

  return res.json({
    success: true,
    message: "Session started",
  });
}

export async function endFocusSession(req: Request, res: Response) {
  const userId = new Types.ObjectId(req.user!.id);

  const streak = await UserStreakModel.findOne({ userId });

  if (!streak || !streak.sessionStartTime) {
    return res.status(400).json({
      message: "No active session",
    });
  }

  const endTime = new Date();

  let durationSeconds = Math.floor(
    (endTime.getTime() - streak.sessionStartTime.getTime()) / 1000
  );

  // Reset active session
  streak.sessionStartTime = undefined;
  await streak.save();

  // Ignore negative or tiny durations
  if (durationSeconds <= 5) {
    return res.json({
      success: true,
      message: "Session too short, ignored",
    });
  }

  // Cap duration to 4 hours
  const MAX_SESSION_SECONDS = 4 * 3600;
  durationSeconds = Math.min(durationSeconds, MAX_SESSION_SECONDS);

  try {
    await updateStreakAfterFocus(userId, durationSeconds);
  } catch (err) {
    console.error("Streak update failed:", err);
  }

  return res.json({
    success: true,
    durationSeconds,
  });
}
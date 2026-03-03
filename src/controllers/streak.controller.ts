import { Request, Response } from "express";
import { Types } from "mongoose";
import { UserStreakModel } from "../models/userStreak.model";
import { yesterdayUTC7, startOfDayUTC7 } from "../utils/dateUTC7";

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
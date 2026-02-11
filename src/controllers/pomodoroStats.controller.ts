import { Request, Response } from "express";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";
import { Types } from "mongoose";

//  * Returns the start of the current day (00:00)
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

//  * Returns the start of the current week (Sunday)
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

//  * Returns the start of the current month
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

//  * Aggregates total focus time and session count
//  * optionally filtered by a starting date
async function aggregate(userId: any, from?: Date) {
  const match: any = { userId };

  // Apply date filter if provided
  if (from) match.completedAt = { $gte: from };

  const result = await PomodoroFocusSessionModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: "$durationSeconds" },
        sessions: { $sum: 1 },
      },
    },
  ]);

  // Return empty stats if no sessions exist
  return result[0] || { totalSeconds: 0, sessions: 0 };
}

//  * Returns focus statistics for the current user
export async function getPomodoroStats(req: Request, res: Response) {
//    * TEMP: hardcoded user ID
  const userId = new Types.ObjectId((req as any).user.id);

  const now = new Date();

//    * Calculate stats in parallel for performance
  const [daily, weekly, monthly, allTime] = await Promise.all([
    aggregate(userId, startOfDay(now)),
    aggregate(userId, startOfWeek(now)),
    aggregate(userId, startOfMonth(now)),
    aggregate(userId),
  ]);

//    * Return aggregated statistics
  return res.json({
    daily,
    weekly,
    monthly,
    allTime,
  });
}

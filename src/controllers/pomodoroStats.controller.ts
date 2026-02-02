import { Request, Response } from "express";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";
import { Types } from "mongoose";

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = d.getDate() - day;
    return new Date(d.getFullYear(), d.getMonth(), diff);
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function aggregate(userId: any, from?: Date) {
    const match: any = { userId };
    if (from) match.completedAt = { $gte: from };

    const result = await PomodoroFocusSessionModel.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalMinutes: { $sum: "$durationMinutes" },
                sessions: { $sum: 1 },
            },
        },
    ]);

    return result[0] || { totalMinutes: 0, sessions: 0 };
}

export async function getPomodoroStats(req: Request, res: Response) {
    //   const userId = req.user.id; // or hardcoded for now
    const userId = new Types.ObjectId("64f000000000000000000001");

    const now = new Date();

    const [daily, weekly, monthly, allTime] = await Promise.all([
        aggregate(userId, startOfDay(now)),
        aggregate(userId, startOfWeek(now)),
        aggregate(userId, startOfMonth(now)),
        aggregate(userId),
    ]);

    return res.json({
        daily,
        weekly,
        monthly,
        allTime,
    });
}

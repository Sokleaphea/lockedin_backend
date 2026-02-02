import { Request, Response } from "express";
import { Types } from "mongoose";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";

export async function getPomodoroRanking(req: Request, res: Response) {
    //   const userId = req.user.id;
    const userId = new Types.ObjectId("64f000000000000000000001");


    // TEMP: mock friend list
    const friendIds = [
        new Types.ObjectId(userId),
        new Types.ObjectId("64f000000000000000000002"),
        new Types.ObjectId("64f000000000000000000003"),
    ];

    const ranking = await PomodoroFocusSessionModel.aggregate([
        { $match: { userId: { $in: friendIds } } },
        {
            $group: {
                _id: "$userId",
                totalMinutes: { $sum: "$durationMinutes" },
            },
        },
        { $sort: { totalMinutes: -1 } },
    ]);

    return res.json(ranking);
}

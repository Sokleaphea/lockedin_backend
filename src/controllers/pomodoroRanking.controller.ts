import { Request, Response } from "express";
import { Types } from "mongoose";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";

//  * Returns ranking of user + friends based on total focus time
export async function getPomodoroRanking(req: Request, res: Response) {
//    * TEMP: current user ID (from auth later)
  const userId = new Types.ObjectId((req as any).user.id);

//    * TEMP: mock friend list.
//    * In the future, this will come from a friends/followers system.
  const friendIds = [
    userId,
    new Types.ObjectId("64f000000000000000000002"),
    new Types.ObjectId("64f000000000000000000003"),
  ];

//    * Aggregate focus time for each user
  const ranking = await PomodoroFocusSessionModel.aggregate([
    {
      // Only include sessions from user + friends
      $match: { userId: { $in: friendIds } },
    },
    {
      // Group sessions by user and sum focus time
      $group: {
        _id: "$userId",
        totalSeconds: { $sum: "$durationSeconds" },
      },
    },
    {
      // Sort users by focus time (descending)
      $sort: { totalSeconds: -1 },
    },
  ]);

//    * Return ranking list
  return res.json(ranking);
}

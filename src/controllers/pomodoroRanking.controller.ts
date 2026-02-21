import { Request, Response } from "express";
import { Types } from "mongoose";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";
import { Follow } from "../models/follow.model";

export async function getPomodoroRanking(req: Request, res: Response) {
  try {
    const userId = new Types.ObjectId(req.user!.id);

    // 1️⃣ Users I follow
    const following = await Follow.find({ followerId: userId });
    const followingIds = following.map(f => f.followingId.toString());

    // 2️⃣ Users who follow me
    const followers = await Follow.find({ followingId: userId });
    const followerIds = followers.map(f => f.followerId.toString());

    // 3️⃣ Find mutuals (intersection)
    const mutualIds = followingIds.filter(id =>
      followerIds.includes(id)
    );

    // 4️⃣ Convert back to ObjectId
    const mutualObjectIds = mutualIds.map(id => new Types.ObjectId(id));

    // 5️⃣ Include myself
    const rankingUserIds = [userId, ...mutualObjectIds];

    // 6️⃣ Aggregate focus time
    const ranking = await PomodoroFocusSessionModel.aggregate([
      {
        $match: { userId: { $in: rankingUserIds } },
      },
      {
        $group: {
          _id: "$userId",
          totalSeconds: { $sum: "$durationSeconds" },
        },
      },
      {
        $lookup: {
          from: "users",              // collection name
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          totalSeconds: 1,
          user: {
            _id: "$user._id",
            username: "$user.username",
            displayName: "$user.displayName",
            avatar: "$user.avatar",
          }
        }
      },
      {
        $sort: { totalSeconds: -1 },
      },
    ]);


    return res.json(ranking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch ranking" });
  }


}

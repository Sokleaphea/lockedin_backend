import { Request, Response } from "express";
import User from "../models/user.model";
import { Follow } from "../models/follow.model";
import { UserStreakModel } from "../models/userStreak.model";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        // const userId = new Types.ObjectId(req.user!.id);
        const username = req.params.username;
        const myId = req.user?.id;


        const user = await User.findOne({ username })
            .select("-password -resetOTP -resetOTPExpires -googleId -email -createdAt");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const [followersCount, followingCount] = await Promise.all([
            Follow.countDocuments({followerId: user._id}),
            Follow.countDocuments({followingId: user._id}),
        ]);

        const isFollowing = myId ? await Follow.exists({ follower: myId, following: user._id}): false;
        const streak = await UserStreakModel.findOne({ userId: user._id});
        return res.json({
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            streak: {
                currentStreak: streak?.currentStreak ?? 0,
                longestStreak: streak?.longestStreak ?? 0,
                totalGoalDays: streak?.totalGoalDays ?? 0,
                dailyGoalSeconds: streak?.dailyGoalSeconds ?? 0,
                todayAccumulatedSeconds: streak?.todayAccumulatedSeconds ?? 0,
            },
            stats: {
                followers: followersCount,
                following: followingCount
            },
            isFollowing: !!isFollowing,
            // displayName: user.displayName,
            // avatar: user.avatar,
            // authProvider,
            // followersCount,
            // followingCount,
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Failed to fetch user profile" });
    }
};

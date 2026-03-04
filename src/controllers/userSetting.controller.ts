import { Request, Response } from "express";
import User from "../models/user.model";
import { Follow } from "../models/follow.model";
import { Types } from "mongoose";
import { UserStreakModel } from "../models/userStreak.model";

export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const userId = new Types.ObjectId(req.user!.id);

        const user = await User.findById(userId)
            .select("-password -resetOTP -resetOTPExpires -googleId -email -createdAt");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const streak = await UserStreakModel.findOne(userId)

        const followersCount = await Follow.countDocuments({
            followingId: userId,
        });

        const followingCount = await Follow.countDocuments({
            followerId: userId,
        });

        const authProvider = user.password ? "Google" : "Email/Password";

        return res.json({
            username: user.username,
            bio: user.bio,
            displayName: user.displayName,
            avatar: user.avatar,
            streak: {
                currentStreak: streak?.currentStreak ?? 0,
                longestStreak: streak?.longestStreak ?? 0,
                totalGoalDays: streak?.totalGoalDays ?? 0,
                dailyGoalSeconds: streak?.dailyGoalSeconds ?? 0,
                todayAccumulatedSeconds: streak?.todayAccumulatedSeconds ?? 0,
            },
            authProvider,
            followersCount,
            followingCount,
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch user profile" });
    }
};

export const updateMyProfile = async (req: Request, res: Response) => {
    try {
        const { bio, username, avatar, displayName } = req.body;
        const user = await User.findById(req.user!.id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // if (!bio !== undefined) user!.bio = bio;
        // if (!username !== undefined) user!.username = username;
        // if (!avatar !== undefined) user!.avatar = avatar;
        // if (!dispalyName !== undefined) user!.displayName = dispalyName;
        const USERNAME_COOL_DOWN_DAYS = 14;
        const cooldownMs = USERNAME_COOL_DOWN_DAYS * 24 * 60 * 60 * 1000;
        const now = new Date();
        if (username !== undefined && username !== user.username) {
            if (
                user.lastUsernameUpdate && now.getTime() - user.lastUsernameUpdate.getTime() < cooldownMs 
            ) {
                const nextAllowedDate = new Date(
                    user.lastUsernameUpdate.getTime() + cooldownMs
                );
                return res.status(400).json({
                message: `You can change your username again on ${nextAllowedDate.toDateString()}`,
                });
            }
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    message: "Users already taken"
                })
            }
            user.username = username;
            user.lastUsernameUpdate = now;
        }
        if (bio !== undefined) {
            user.bio = bio;
        }
        if (avatar !== undefined) {
            user.avatar = avatar;
        }
        if (displayName !== undefined) {
            user.displayName = displayName;
        }
        await user.save();
        res.json({ message: "Profile Updated" });
    } catch (err) {
        res.status(500).json({ err });
    }
}
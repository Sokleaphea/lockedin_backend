import { Request, Response } from "express";
import { Types } from "mongoose";
import { Follow } from "../models/follow.model";
import User from "../models/user.model";
import { sendPushNotification } from "../services/notification.service";

export const followUser = async (req: Request, res: Response) => {
    try {
        const followerId = new Types.ObjectId(req.user!.id);
        const rawTarget = req.body.targetUserId;

        if (!rawTarget || Array.isArray(rawTarget)) {
            return res.status(400).json({ message: "Invalid target user ID" });
        }

        if (!Types.ObjectId.isValid(rawTarget)) {
            return res.status(400).json({ message: "Invalid target user ID" });
        }

        const followingId = new Types.ObjectId(rawTarget);

        if (followerId.equals(followingId)) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetExists = await User.findById(followingId);
        if (!targetExists) {
            return res.status(404).json({ message: "User not found" });
        }

        await Follow.create({ followerId, followingId });

        // ✅ Fixed: use targetExists.deviceToken (not rawTarget.deviceToken)
        // Also get follower's display name for the notification message
        const follower = await User.findById(followerId).select("displayName username");
        const followerName = follower?.displayName || follower?.username || "Someone";

        if (targetExists.deviceToken) {
            await sendPushNotification(
                targetExists.deviceToken,
                "New Follower",
                `${followerName} started following you`
            );
        }

        // Check if they follow back (mutual) — notify follower too
        const isFollowedBack = await Follow.findOne({
            followerId: followingId,
            followingId: followerId,
        });

        if (isFollowedBack) {
            // They are now mutual — notify the original follower
            const currentUser = await User.findById(followerId).select("deviceToken");
            const targetName = targetExists.displayName || targetExists.username || "Someone";

            if (currentUser?.deviceToken) {
                await sendPushNotification(
                    currentUser.deviceToken,
                    "You're now connected!",
                    `You and ${targetName} are now following each other`
                );
            }
        }

        return res.status(201).json({ message: "Followed successfully" });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Already following this user" });
        }
        return res.status(500).json({ message: "Failed to follow user" });
    }
};

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const followerId = new Types.ObjectId(req.user!.id);
        const rawTarget = req.params.targetUserId;

        if (!rawTarget || Array.isArray(rawTarget)) {
            return res.status(400).json({ message: "Invalid target user ID" });
        }

        if (!Types.ObjectId.isValid(rawTarget)) {
            return res.status(400).json({ message: "Invalid target user ID" });
        }

        const followingId = new Types.ObjectId(rawTarget);

        const result = await Follow.findOneAndDelete({ followerId, followingId });

        if (!result) {
            return res.status(404).json({ message: "Follow relationship not found" });
        }

        return res.json({ message: "Unfollowed successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to unfollow user" });
    }
};

export const getFollowers = async (req: Request, res: Response) => {
    try {
        const userId = new Types.ObjectId(req.user!.id);

        const followers = await Follow.find({ followingId: userId });
        const followerIds = followers.map(f => f.followerId);

        const following = await Follow.find({ followerId: userId });
        const followingIds = following.map(f => f.followingId.toString());

        const users = await User.find({ _id: { $in: followerIds } })
            .select("username displayName avatar");

        const result = users.map(user => ({
            ...user.toObject(),
            isMutual: followingIds.includes(user._id.toString()),
        }));

        return res.json(result);
    } catch {
        return res.status(500).json({ message: "Failed to fetch followers" });
    }
};

export const getFollowing = async (req: Request, res: Response) => {
    try {
        const userId = new Types.ObjectId(req.user!.id);

        const following = await Follow.find({ followerId: userId });
        const followingIds = following.map(f => f.followingId);

        const followers = await Follow.find({ followingId: userId });
        const followerIds = followers.map(f => f.followerId.toString());

        const users = await User.find({ _id: { $in: followingIds } })
            .select("username displayName avatar");

        const result = users.map(user => ({
            ...user.toObject(),
            isMutual: followerIds.includes(user._id.toString()),
        }));

        return res.json(result);
    } catch {
        return res.status(500).json({ message: "Failed to fetch following" });
    }
};
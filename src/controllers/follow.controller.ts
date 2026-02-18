import { raw, Request, Response } from "express";
import { Types } from "mongoose";
import { Follow } from "../models/follow.model";
import User from "../models/user.model";

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

        await Follow.create({
            followerId,
            followingId,
        });

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

        const result = await Follow.findOneAndDelete({
            followerId,
            followingId,
        });

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

        const users = await User.find({ _id: { $in: followerIds } })
            .select("username displayName avatar");

        return res.json(users);
    } catch {
        return res.status(500).json({ message: "Failed to fetch followers" });
    }
};

export const getFollowing = async (req: Request, res: Response) => {
    try {
        const userId = new Types.ObjectId(req.user!.id);

        const following = await Follow.find({ followerId: userId });

        const followingIds = following.map(f => f.followingId);

        const users = await User.find({ _id: { $in: followingIds } })
            .select("username displayName avatar");

        return res.json(users);
    } catch {
        return res.status(500).json({ message: "Failed to fetch following" });
    }
};

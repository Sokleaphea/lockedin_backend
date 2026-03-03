import { Request, Response } from "express";
import User from "../models/user.model";
import { Follow } from "../models/follow.model";

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

        const followersCount = await Follow.countDocuments({
            followingId: user._id,
        });

        const followingCount = await Follow.countDocuments({
            followerId: user._id,
        });
        const isFollowing = myId ? await Follow.exists({
            follower: myId,
            following: user._id,
        }) : false;

        return res.json({
            username: user.username,
            displayName: user.displayName,
            stats: {
                followers: followersCount,
                following: followingCount
            },
            isFollowing: !!isFollowing
            // bio: user.bio,
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

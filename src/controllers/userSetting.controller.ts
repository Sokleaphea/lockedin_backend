import { Request, Response } from "express";
import User from "../models/user.model";

export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.id).select("-password -resetOTP -resetOTPExpires -googleId -id -email -createdAt");
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        const authProvider = user!.password ? "Google" : "Email/Password";
        res.json({
            username: user.username,
            bio: user.bio,
            displayName: user.displayName,
            avatar: user.avatar,
            authProvider,
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user profile"});
    }
}
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
        if (username !== undefined) {
            user.username = username;
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
        await user.save();
        res.json({ message: "Profile Updated" });
    } catch (err) {
        res.status(500).json({ err});
    }
}
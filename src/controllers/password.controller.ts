import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.model";
import sendEmail from "../utils/sendEmail";
import bcrypt from "bcryptjs";


export const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 900000).toString(); 
}

export const sendOTP = async (req: Request, res: Response) => {
    const {email} = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.resetOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 100);
    await user.save();

    await sendEmail({
        to: user.email,
        subject: "Your OTP code",
        text: `Your OTP is: ${otp}. Expires in 10 minutes`,
    });
    res.json({ message: "OTP sent" });
};

export const resetPasswordWithOTP = async (req: Request, res: Response) => {
    const {email, otp, newPassword} = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    if (!user.resetOTP || user.resetOTP !== hashedOTP || !user.resetOTPExpires || user.resetOTPExpires < new Date()) {
        return res.status(400).json({ message: "Invalid or expire OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
};
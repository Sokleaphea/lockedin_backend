import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.model";
import sendEmail from "../utils/sendEmail";
import bcrypt from "bcryptjs";


export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
}

export const sendOTP = async (req: Request, res: Response) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
    
        if (!user.password) {
            return res.status(400).json({ message: "Password reset not available for this account"});
        }
    
        const otp = generateOTP();
        user.resetOTP = crypto.createHash("sha256").update(otp).digest("hex");
        user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        try {
            await sendEmail({
                to: user.email,
                subject: "Your OTP code",
                text: `Your OTP is: ${otp}.`,
                html:`<h2>Welcome to LockedIn!</h2>
                    <p>Greeeting, ${user.username},</p>
                    <p>Please use the OTP below to reset your password:</p>
                    <h3 style="color: #e1842d;">${otp}</h3>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, you can ignore this email.</p>
                    <hr/>
                    <p>The LockedIn Team</p>`
            });
        } catch (err) {
            console.error("SendGrid failed:", err);
        }   
        return res.status(500).json({ message: "Failed to send OTP email" });
    } catch (err) {
        console.error("sendOTP route failed:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPasswordWithOTP = async (req: Request, res: Response) => {
    const {email, otp, newPassword} = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if(!user.password) {
        return res.status(400).json({ message: "Password reset not available for Google login users"});
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    if (!user.resetOTP || user.resetOTP !== hashedOTP || !user.resetOTPExpires || user.resetOTPExpires < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
};
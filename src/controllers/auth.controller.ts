import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, confirmPassword } = req.body;
        if (!email || !password || !username || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long"})
        }
        if (!email.endsWith("@gmail.com")) {
            return res.status(400).json({ message: "Email must end with @gmail.com"});
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        const minUsernameLength = 5;
        const maxUsernameLength = 30;
        if (username.length < minUsernameLength || username.length > maxUsernameLength) {
            return res.status(400).json({
                message: `Username must be between ${minUsernameLength} and ${maxUsernameLength} characters long`
            });
        }
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message: "Username can only contain letters, numbers, and underscore. No spaces."
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exist"})
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exist" })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
        await User.create({
            email,
            password: hashedPassword,
            emailOTP: hashedOTP,
            emailOTPExpires: Date.now() + 10 * 60 * 1000,
            username,
            isVerified: false,
        });
        await sendEmail({
            to: email,
            subject: "Verify your Gmail for LockedIn",
            text: `Your OTP code is ${otp}.`,
            html: `
            <h2>Welcome to LockedIn!</h2>
            <p>Greeeting, ${username},</p>
            <p>Please use the OTP below to verify your email address:</p>
            <h3 style="color: #e1842d;">${otp}</h3>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, you can ignore this email.</p>
            <hr/>
            <p>The LockedIn Team</p>
            `
        });
        res.status(201).json({ message: "User registered successfully" })
    } catch (err) { 
        console.log(err);
        res.status(500).json({ message: "Registration failed" })
    }

};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials"})
        }

        // if (user.authProvider === "google") {
        //     return res.status(400).json({ message: "This account is registered with Google. Please login with Google instead." });
        // }
        if (!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email first" });
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id},
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" },
        );
        res.json({token});
    } catch (err) {
        res.status(500).json({ message: "Login failed" })
    }
}

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const { email, sub: googleId, name, picture } = payload;

        // Check if user exists or create new user
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                username: email!.split("@")[0],
                googleId,
                displayName: name,
                avatar: picture,
                isVerified: true, // Google accounts are pre-verified
            });
        } else if (!user.googleId) {
            // Update existing user with Google info
            user.googleId = googleId;
            user.displayName = name;
            user.avatar = picture;
            user.isVerified = true;
            await user.save();
        }

        // Generate your app's JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                },
            },
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
}
export const verifyEmailOTP = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });
    if (!user.emailOTP || !user.emailOTPExpires || user.emailOTPExpires.getTime() < Date.now()) {
        return res.status(400).json({ message: "OTP Expired" });
    }
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOTP !== user.emailOTP) return res.status(400).json({ message: "Invalid OTP" });
    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
}
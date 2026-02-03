import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, confirmPassword } = req.body;
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
        await User.create({
            email,
            password: hashedPassword,
            username,
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

        const isMatch = await bcrypt.compare(password, user.password);
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
        res.status(500).json({ message: "Login failed"})
    }
}
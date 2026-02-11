import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/userSetting.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model";

const storage = multer.memoryStorage();//store on RAM instead of disk
const upload = multer({ storage}); 
const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.patch("/profile", authMiddleware, updateMyProfile);
router.patch("/profile/avatar", authMiddleware, upload.single("avatar"), async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const streamUpload = (buffer: Buffer) => {
            return new Promise<string>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "users/avatars"}, (error, result ) => {
                        if (error) return reject(error); 
                        resolve(result!.secure_url);
                    
                    }
                );
                stream.on('error', reject);
                stream.end(buffer);
            }); 
        };
        const imageUrl = await streamUpload(req.file.buffer);
        const user = await User.findById(req.user!.id);

        if (!user) return res.status(404).json({ message: "User not found" });
        user.avatar = imageUrl;
        await user.save();
        res.json({ message: "Avatar updated", avatar: user.avatar});
    } catch (err) {
        res.status(500).json({ message: "Failed to upload avatar", error: err.message || err });
    }
});

export default router;
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

/**
 * @swagger
 * tags:
 *   name: User Settings
 *   description: User profile management APIs
 */

/**
 * @swagger
 * /api/setting/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized – missing or invalid token
 * /api/setting/profile:
 *   patch:
 *     summary: Update my profile
 *     tags: [User Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: "Light"
 *                 maxLength: 50
 *               bio:
 *                 type: string
 *                 maxLength: 160
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
  * /api/setting/profile/avatar:
 *   patch:
 *     summary: Upload or update user avatar
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatar:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to upload avatar
 */

router.get("/me", authMiddleware, getMyProfile);
router.patch("/profile", authMiddleware, updateMyProfile);
router.patch("/profile/avatar", authMiddleware, upload.single("avatar"), async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const streamUpload = (buffer: Buffer) => {
            return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "users/avatars"}, (error, result ) => {
                        if (error) return reject(error); 
                        resolve(result! as { secure_url: string, public_id: string});
                    
                    }
                );
                stream.on('error', reject);
                stream.end(buffer);
            }); 
        };
        const result = await streamUpload(req.file.buffer);
        const user = await User.findById(req.user!.id);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId);
        }
        //save
        user.avatar = result.secure_url;
        user.avatarPublicId = result.public_id;
        await user.save();
        function extractPublicId(url: string): string {
            const parts = url.split("/upload/")[1];     
            const publicIdWithExt = parts.split(".")[0]; 
            return publicIdWithExt;
        }

        // delete past user's avatar that does'nt have avatar public id
        const oldUsers = await User.find({ avatarPublicId: {$exists: false}, avatar: {$exists: true}});
        for (const u of oldUsers) {
            if (!u.avatar) continue;
            const publicId = extractPublicId(u.avatar); 
            await cloudinary.uploader.destroy(publicId);
        }
        res.json({ message: "Avatar updated", avatar: user.avatar});
    } catch (err) {
        res.status(500).json({ message: "Failed to upload avatar", err });
    }
});

export default router;
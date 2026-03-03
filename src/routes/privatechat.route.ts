import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  generatePrivateChatToken,
  createPrivateChannel,
  getPrivateChats,
} from "../controllers/privatechat.controller";

const router = Router();

router.use(authMiddleware);

router.post("/token", generatePrivateChatToken);
router.get("/", getPrivateChats);
router.post("/channel", createPrivateChannel);

export default router;
/**
 * @swagger
 * /api/privatechat/token:
 *   post:
 *     summary: Generate Stream authentication token
 *     description: |
 *       Generates a Stream Chat authentication token for the authenticated user.
 *       This allows the frontend SDK to connect to Stream.
 *
 *       - User must be authenticated via JWT.
 *       - Automatically syncs user profile to Stream.
 *     tags:
 *       - PrivateChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "78fs9a2hku34"
 *                     name:
 *                       type: string
 *                       example: "john_doe"
 *                     image:
 *                       type: string
 *                       nullable: true
 *                       example: "https://res.cloudinary.com/..."
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/privatechat/channel:
 *   post:
 *     summary: Create or retrieve private 1-on-1 chat channel
 *     description: |
 *       Creates (or retrieves) a deterministic private chat channel between two users.
 *
 *       Requirements:
 *       - Target user must exist.
 *       - Users must mutually follow each other.
 *       - A user cannot chat with themselves.
 *
 *       The channel ID is deterministic:
 *       private-{smallerUserId}-{largerUserId}
 *
 *       This ensures:
 *       - Only one 1-on-1 chat per user pair.
 *       - No duplicate conversations.
 *     tags:
 *       - PrivateChat
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user to chat with
 *                 example: "78fs9a2hku34"
 *             required:
 *               - targetUserId
 *     responses:
 *       200:
 *         description: Private channel created or retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 channelId:
 *                   type: string
 *                   example: "private-52j3hk4h3j67-78fs9a2hku34"
 *       400:
 *         description: Invalid user ID or self-chat attempt
 *       403:
 *         description: Users are not mutual followers
 *       404:
 *         description: Target user not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/privatechat:
 *   get:
 *     summary: Get all private chats for authenticated user
 *     tags:
 *       - PrivateChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of private chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chatId:
 *                     type: string
 *                   channelId:
 *                     type: string
 *                   otherUserId:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
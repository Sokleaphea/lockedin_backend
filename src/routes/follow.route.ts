import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", followUser);
router.delete("/:targetUserId", unfollowUser);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

export default router;

/**
 * @swagger
 * /api/follow:
 *   post:
 *     summary: Follow a user
 *     description: Allows the authenticated user to follow another existing user.
 *     tags: [Follow]
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
 *                 description: ObjectId of the user to follow
 *                 example: "69880a3cd48b713c3e68afc9"
 *             required:
 *               - targetUserId
 *     responses:
 *       201:
 *         description: Successfully followed user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Followed successfully"
 *       400:
 *         description: Invalid user ID, self-follow attempt, or already following
 *       404:
 *         description: Target user not found
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 *
 * /api/follow/{targetUserId}:
 *   delete:
 *     summary: Unfollow a user
 *     description: Removes the follow relationship between the authenticated user and the specified user.
 *     tags: [Follow]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId of the user to unfollow
 *         example: "69880a3cd48b713c3e68afc9"
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unfollowed successfully"
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: Follow relationship not found
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 *
 * /api/follow/followers:
 *   get:
 *     summary: Get list of followers
 *     description: Retrieves all users who follow the authenticated user, including mutual follow status.
 *     tags: [Follow]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved followers list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   displayName:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   isMutual:
 *                     type: boolean
 *                     example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/follow/following:
 *   get:
 *     summary: Get list of following users
 *     description: Retrieves all users the authenticated user is following, including mutual follow status.
 *     tags: [Follow]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved following list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   displayName:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   isMutual:
 *                     type: boolean
 *                     example: false
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */ 
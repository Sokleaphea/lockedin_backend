import { authMiddleware } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import router from "./auth.route";
import { getUserProfile } from "../controllers/userProfile.controller";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile operations
 */

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user profile by username
 *     description: Retrieve a user's profile information by their username. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 displayName:
 *                   type: string
 *                   example: John Doe
 *                 following:
 *                   type: integer
 *                   example: 150
 *                 followers:
 *                   type: integer
 *                   example: 200
 *                 bio:
 *                   type: string
 *                   example: Developer and tech enthusiast
 *                 streak:
 *                   type: integer
 *                   description: Number of consecutive days the user has been active
 *                   example: 5
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.use(authMiddleware);
router.get("/:username", authMiddleware, getUserProfile);

export default router;
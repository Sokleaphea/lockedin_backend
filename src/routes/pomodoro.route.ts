import { Router } from "express";
import { createPomodoroSession } from "../controllers/pomodoroSession.controller";
import { getPomodoroStats } from "../controllers/pomodoroStats.controller";
import { getPomodoroRanking } from "../controllers/pomodoroRanking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware); // enable later

router.post("/session", createPomodoroSession);
router.get("/stats", getPomodoroStats);
router.get("/ranking", getPomodoroRanking);

export default router;

/**
 * @swagger
 * /api/pomodoro/session:
 *   post:
 *     summary: Create a Pomodoro focus session
 *     description: |
 *       Records a completed focus session for the authenticated user.
 *       
 *       - Only sessions with type "focus" are saved.
 *       - Non-focus sessions (e.g., break) are acknowledged but not stored.
 *       - durationSeconds must be a positive number.
 *     tags:
 *       - Pomodoro
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of session (only "focus" is saved)
 *                 example: "focus"
 *               durationSeconds:
 *                 type: number
 *                 description: Duration of the session in seconds
 *                 example: 1500
 *             required:
 *               - type
 *               - durationSeconds
 *     responses:
 *       200:
 *         description: Session processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session saved successfully"
 *       400:
 *         description: Invalid duration
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 *
 * /api/pomodoro/stats:
 *   get:
 *     summary: Get Pomodoro statistics
 *     description: |
 *       Retrieves aggregated focus session statistics for the authenticated user.
 *       
 *       Returns:
 *       - Daily stats (since start of day)
 *       - Weekly stats (since start of week)
 *       - Monthly stats (since start of month)
 *       - All-time stats
 *     tags:
 *       - Pomodoro
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 daily:
 *                   type: object
 *                   properties:
 *                     totalSeconds:
 *                       type: number
 *                       example: 3600
 *                     sessions:
 *                       type: number
 *                       example: 2
 *                 weekly:
 *                   type: object
 *                   properties:
 *                     totalSeconds:
 *                       type: number
 *                       example: 10800
 *                     sessions:
 *                       type: number
 *                       example: 6
 *                 monthly:
 *                   type: object
 *                   properties:
 *                     totalSeconds:
 *                       type: number
 *                       example: 43200
 *                     sessions:
 *                       type: number
 *                       example: 24
 *                 allTime:
 *                   type: object
 *                   properties:
 *                     totalSeconds:
 *                       type: number
 *                       example: 86400
 *                     sessions:
 *                       type: number
 *                       example: 48
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 *
 * /api/pomodoro/ranking:
 *   get:
 *     summary: Get mutual follow ranking
 *     description: |
 *       Returns a ranking of focus time among:
 *       - The authenticated user
 *       - Users with mutual follow relationships
 *       
 *       Ranking is sorted in descending order by totalSeconds.
 *     tags:
 *       - Pomodoro
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved ranking
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   totalSeconds:
 *                     type: number
 *                     example: 4500
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "698808a9fa68c908e9240d8a"
 *                       username:
 *                         type: string
 *                         example: "john_doe"
 *                       displayName:
 *                         type: string
 *                         example: "John Doe"
 *                       avatar:
 *                         type: string
 *                         example: "https://res.cloudinary.com/..."
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 */
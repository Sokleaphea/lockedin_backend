import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getStreak,
  updateDailyGoal,
  recordFocusTime,
  startFocusSession,
  endFocusSession,
} from "../controllers/streak.controller";

const router = Router();

router.use(authMiddleware);

router.post("/goal", updateDailyGoal);
router.get("/", getStreak);
router.post("/session", recordFocusTime);
router.post("/start", startFocusSession);
router.post("/end", endFocusSession);

export default router;

/**
 * @swagger
 * tags:
 *   name: Streak
 *   description: |
 *     Productivity streak tracking.
 *
 *     Streaks increase when the user reaches their daily focus goal.
 *
 *     The system accumulates productive time sent by the frontend
 *     when users leave productivity screens (timer, study room, etc).
 *
 *     Key Concepts:
 *     - dailyGoalSeconds → user defined target
 *     - todayAccumulatedSeconds → total productive time today
 *     - currentStreak → consecutive days meeting goal
 *     - longestStreak → highest streak achieved
 *     - totalGoalDays → total days goal achieved
 */

/**
 * @swagger
 * /api/streak:
 *   get:
 *     summary: Get streak statistics
 *     description: |
 *       Returns the authenticated user's streak statistics.
 *
 *       Behavior:
 *       - Creates a streak record automatically if one does not exist.
 *       - Performs a lazy reset if the user missed a day.
 *
 *       Lazy Reset Rule:
 *       If the last goal met date is older than yesterday,
 *       the current streak resets to 0.
 *
 *     tags:
 *       - Streak
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Streak data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentStreak:
 *                   type: number
 *                   example: 4
 *                 longestStreak:
 *                   type: number
 *                   example: 10
 *                 totalGoalDays:
 *                   type: number
 *                   example: 23
 *                 dailyGoalSeconds:
 *                   type: number
 *                   example: 1800
 *                 todayAccumulatedSeconds:
 *                   type: number
 *                   example: 1200
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/streak/goal:
 *   post:
 *     summary: Update daily focus goal
 *     description: |
 *       Updates the user's daily productivity goal.
 *
 *       The goal is expressed in seconds and represents the
 *       amount of productive time required to count the day
 *       toward the streak.
 *
 *       Example:
 *       - 1800 = 30 minutes
 *       - 3600 = 1 hour
 *
 *     tags:
 *       - Streak
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyGoalSeconds:
 *                 type: number
 *                 example: 1800
 *             required:
 *               - dailyGoalSeconds
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid goal value
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/streak/session:
 *   post:
 *     summary: Record productive time
 *     description: |
 *       Records productive focus time for the authenticated user.
 *
 *       This endpoint is typically called when a user exits a
 *       productivity screen (e.g. Pomodoro, flashcards, study room).
 *
 *       The backend accumulates the time for the current day.
 *
 *       If the accumulated time reaches the user's daily goal:
 *       - The streak increases by 1
 *       - totalGoalDays increases
 *       - longestStreak updates if applicable
 *
 *       A day can only count toward the streak once.
 *
 *     tags:
 *       - Streak
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               durationSeconds:
 *                 type: number
 *                 example: 1500
 *             required:
 *               - durationSeconds
 *     responses:
 *       200:
 *         description: Focus time recorded
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
 *                   example: Focus time recorded
 *       400:
 *         description: Invalid duration
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update streak
 */

/**
 * @swagger
 * /api/streak/start:
 *   post:
 *     summary: Start a productivity session
 *     description: |
 *       Marks the beginning of a productivity session.
 *
 *       This endpoint is typically called when the user enters a
 *       productivity screen such as:
 *       - Pomodoro timer
 *       - Flashcards
 *       - Study room
 *       - Task breakdown
 *
 *       Behavior:
 *       - Stores the current server timestamp as `sessionStartTime`.
 *       - Only one active session is allowed per user.
 *       - If a session is already active, the request is rejected.
 *
 *       The session duration will be calculated when `/api/streak/end`
 *       is called.
 *
 *     tags:
 *       - Streak
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session started successfully
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
 *                   example: Session started
 *       400:
 *         description: A session is already active
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/streak/end:
 *   post:
 *     summary: End a productivity session
 *     description: |
 *       Ends the current productivity session and calculates
 *       the total focus time.
 *
 *       Behavior:
 *       - Calculates duration using:
 *         `duration = currentTime - sessionStartTime`
 *       - Duration is converted to seconds.
 *       - Duration is capped to a maximum session limit (e.g. 4 hours).
 *       - The duration is added to today's accumulated focus time.
 *
 *       If the user's daily goal is reached:
 *       - `currentStreak` increases
 *       - `totalGoalDays` increases
 *       - `longestStreak` updates if applicable
 *
 *       The active session is cleared after processing.
 *
 *     tags:
 *       - Streak
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session ended and duration recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 durationSeconds:
 *                   type: number
 *                   example: 1500
 *       400:
 *         description: No active session
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update streak
 */
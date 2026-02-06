import { Router } from "express";

// Controller that handles saving a pomodoro session
import { createPomodoroSession } from "../controllers/pomodoroSession.controller";

// Controller that calculates focus statistics (daily / weekly / etc.)
import { getPomodoroStats } from "../controllers/pomodoroStats.controller";

// Controller that ranks user + friends by focus time
import { getPomodoroRanking } from "../controllers/pomodoroRanking.controller";

// Create an Express router instance
const router = Router();


// POST /api/pomodoro/session
// Saves a completed pomodoro focus session
router.post("/session", createPomodoroSession);

// GET /api/pomodoro/stats
// Returns aggregated focus statistics for the current user
 
router.get("/stats", getPomodoroStats);

// GET /api/pomodoro/ranking
// Returns ranking of user + friends based on focus time
router.get("/ranking", getPomodoroRanking);

export default router;

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

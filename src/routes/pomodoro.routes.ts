import { Router } from "express";
import { createPomodoroSession } from "../controllers/pomodoroSession.controller";

const router = Router();

router.post("/session", createPomodoroSession);

export default router;

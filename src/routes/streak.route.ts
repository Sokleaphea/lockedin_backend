import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getStreak,
  updateDailyGoal,
} from "../controllers/streak.controller";

const router = Router();

router.use(authMiddleware);

router.post("/goal", updateDailyGoal);
router.get("/", getStreak);

export default router;
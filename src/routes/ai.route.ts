import { Router } from "express";
import { taskBreakdownController } from "../controllers/ai.controller";
const router = Router();

router.post("/task-breakdown", taskBreakdownController);

export default router;

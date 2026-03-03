import { authMiddleware } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import router from "./auth.route";
import { getUserProfile } from "../controllers/userProfile.controller";

router.use(authMiddleware);

router.get("/:username", authMiddleware, getUserProfile);

export default router;
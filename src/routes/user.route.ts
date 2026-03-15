import { authMiddleware } from "../middlewares/auth.middleware";
import { Router } from "express";
import { getUserProfile, searchUsers, saveDeviceToken } from "../controllers/userProfile.controller";

const router = Router();

router.use(authMiddleware);
router.get("/search", searchUsers);
router.get("/:username", getUserProfile);
router.patch("/device-token", saveDeviceToken); // ✅ PATCH not POST, controller imported not inline

export default router;
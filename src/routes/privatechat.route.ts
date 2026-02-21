import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  generatePrivateChatToken,
  createPrivateChannel,
} from "../controllers/privatechat.controller";

const router = Router();

router.use(authMiddleware);

router.post("/token", generatePrivateChatToken);
router.post("/channel", createPrivateChannel);

export default router;
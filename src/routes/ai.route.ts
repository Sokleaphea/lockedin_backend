import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  chatController,
  getChatsController,
  getChatByIdController,
} from "../controllers/ai.controller";

const router = Router();

router.use(authMiddleware);

router.post("/task-breakdown/chat", chatController);
router.get("/chats", getChatsController);
router.get("/chats/:chatId", getChatByIdController);

export default router;

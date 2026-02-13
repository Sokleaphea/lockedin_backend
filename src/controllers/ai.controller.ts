import { Request, Response } from "express";
import { Types } from "mongoose";
import { validateAiInput, isUnrelatedInput } from "../utils/aiValidation";
import {
  handleChatMessage,
  getUserChats,
  getChatWithMessages,
} from "../services/ai.service";

export async function chatController(req: Request, res: Response) {
  try {
    const userId = new Types.ObjectId((req as any).user.id);
    const { message, chatId } = req.body;

    const validation = validateAiInput(message);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (isUnrelatedInput(message)) {
      return res.status(400).json({
        error:
          "This input is not related to task breakdown. Please provide a goal or task to break down.",
      });
    }

    if (chatId && !Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat session ID" });
    }

    const result = await handleChatMessage(userId, message.trim(), chatId);

    return res.status(chatId ? 200 : 201).json(result);
  } catch (error: any) {
    console.error("Chat error:", error);

    if (error.message === "Chat session not found") {
      return res.status(404).json({ error: "Chat session not found" });
    }

    return res.status(500).json({ error: "AI chat processing failed" });
  }
}

export async function getChatsController(req: Request, res: Response) {
  try {
    const userId = new Types.ObjectId((req as any).user.id);
    const chats = await getUserChats(userId);
    return res.status(200).json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    return res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
}

export async function getChatByIdController(req: Request, res: Response) {
  try {
    const userId = new Types.ObjectId((req as any).user.id);
    const chatId = req.params.chatId as string;

    if (!Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat session ID" });
    }

    const result = await getChatWithMessages(userId, chatId);

    if (!result) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get chat error:", error);
    return res.status(500).json({ error: "Failed to fetch chat session" });
  }
}

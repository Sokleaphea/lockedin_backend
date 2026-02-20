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

/**
 * @swagger
 * /api/ai/task-breakdown/chat:
 *   post:
 *     summary: Start or continue an AI task breakdown chat
 *     description: |
 *       Creates a new chat session or continues an existing one to break down goals into actionable steps.
 *       
 *       - If no chatId is provided, a new session is created.
 *       - If chatId is provided, the message is added to the existing session.
 *       - The AI will ask clarifying questions if the goal is vague.
 *       - Returns unsupported_request if the input is unrelated to task breakdown.
 *     tags:
 *       - AI Task Breakdown
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: Optional chat session ID for continuing an existing conversation
 *                 example: "65a1b2c3d4e5f6g7h8i9j0k"
 *               message:
 *                 type: string
 *                 description: The user's goal or task to break down, or a refining message
 *                 example: "Build a personal finance tracker app"
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Successfully processed the task breakdown request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schema/ChatResponse'
 *             examples:
 *               planned:
 *                 value:
 *                   chatId: "65a1b2c3d4e5f6g7h8i9j0k"
 *                   response:
 *                     status: "planned"
 *                     steps:
 *                       - step: 1
 *                         title: "Setup project structure"
 *                         description: "Create folder hierarchy and initialize git repo"
 *                       - step: 2
 *                         title: "Design database schema"
 *                         description: "Plan tables for users, transactions, and categories"
 *               clarification_required:
 *                 value:
 *                   chatId: "65a1b2c3d4e5f6g7h8i9j0k"
 *                   response:
 *                     status: "clarification_required"
 *                     steps: []
 *                     clarification_question: "What programming language and framework do you want to use?"
 *               unsupported:
 *                 value:
 *                   chatId: "65a1b2c3d4e5f6g7h8i9j0k"
 *                   response:
 *                     status: "unsupported_request"
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error during AI processing
 */

/**
 * @swagger
 * /api/ai/chats:
 *   get:
 *     summary: Get all chat sessions for the current user
 *     description: Retrieves a list of all chat sessions created by the authenticated user, with their metadata.
 *     tags:
 *       - AI Task Breakdown
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Maximum number of chats to return
 *         example: 10
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of chats to skip for pagination
 *         example: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved chat sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65a1b2c3d4e5f6g7h8i9j0k"
 *                       title:
 *                         type: string
 *                         example: "Build a personal finance tracker app"
 *                       status:
 *                         type: string
 *                         enum: ["planned", "clarification_required"]
 *                         example: "planned"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-02-20T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-02-20T10:05:00.000Z"
 *                 total:
 *                   type: number
 *                   example: 5
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/ai/chats/{chatId}:
 *   get:
 *     summary: Get a specific chat session with all its messages
 *     description: Retrieves a single chat session and all messages in the conversation history.
 *     tags:
 *       - AI Task Breakdown
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chat session
 *         example: "65a1b2c3d4e5f6g7h8i9j0k"
 *     responses:
 *       200:
 *         description: Successfully retrieved chat session with messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schema/ChatSession'
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       404:
 *         description: Chat session not found or user does not have access
 *       500:
 *         description: Server error
 */

export default router;

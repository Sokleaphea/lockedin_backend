import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

/**
 * @swagger
 * /api/todo/tasks:
 *   get:
 *     summary: Get all todos
 *     tags: [Todos]
 *     security: 
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "64f2ab1234abcd5678ef90"
 *                   title:
 *                     type: string
 *                     example: "Buy milk"
 *                   completed:
 *                     type: boolean
 *                     example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy milk"
 *               description: 
 *                 type: string
 *                 example: "Kirisur milk at Lucky"
 *               status:
 *                 type: boolean
 *                 example: "pending"
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64f2ab1234abcd5678ef90"
 *                 title:
 *                   type: string
 *                   example: "Buy milk"
 *                 completed:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 * /api/todo/tasks/{id}:
 *   patch:
 *     summary: Update todos
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters: 
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the todo to update
 *         schema:
 *           type: string
 *           example: "64f2ab1234abcd5678ef90"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy milk"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64f2ab1234abcd5678ef90"
 *                 title:
 *                   type: string
 *                   example: "Buy milk"
 *                 completed:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *   delete:
 *     summary: Delete todos
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters: 
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the todo to delete
 *         schema:
 *           type: string
 *           example: "64f2ab1234abcd5678ef90"
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todo deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todo not found"
 */
router.use(authMiddleware)
router.post("/tasks", createTodo);
router.get("/tasks", getTodos);
router.patch("/tasks/:id", updateTodo);
router.delete("/tasks/:id", deleteTodo);

export default router;

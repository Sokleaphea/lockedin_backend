import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller";

const router = Router();

router.post("/tasks", createTodo);
router.get("/tasks", getTodos);
router.patch("/tasks/:id", updateTodo);
router.delete("/tasks/:id", deleteTodo);

export default router;

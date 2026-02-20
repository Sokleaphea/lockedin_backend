import { Request, Response } from "express";
import { Todo, TodoStatus } from "../models/todo.model";

// Validate date-like input (string or Date) and reject empty values.
const isValidDate = (value: unknown): value is string | Date => {
  if (value === undefined || value === null || value === "") {
    return false;
  }
  const date = new Date(value as string);
  return !Number.isNaN(date.getTime());
};

// Ensure status is one of the allowed values.
const isValidStatus = (status: unknown): status is TodoStatus => {
  return status === "pending" || status === "completed";
};

// Create a new task.
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { userId, title, description, status, dueDate } = req.body;

    // if (!userId) {
    //   return res.status(400).json({ message: "userId is required" });
    // }

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    if (status !== undefined && !isValidStatus(status)) {
      return res
        .status(400)
        .json({ message: "status must be 'pending' or 'completed'" });
    }

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      if (!isValidDate(dueDate)) {
        return res.status(400).json({ message: "dueDate is invalid" });
      }
    }

    const todo = await Todo.create({
      userId,
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create todo" });
  }
};

// Get all tasks, optionally filtered by userId.
export const getTodos = async (req: Request, res: Response) => {
  try {
    // const userId = req.query.userId as string | undefined;
    const userId = ( req as any ).user.id;

    const filter = userId ? { userId } : {};
    const todos = await Todo.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch todos" });
  }
};

// Update a task by _id.
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate } = req.body;

    if (title !== undefined && title === "") {
      return res.status(400).json({ message: "title cannot be empty" });
    }

    if (status !== undefined && !isValidStatus(status)) {
      return res
        .status(400)
        .json({ message: "status must be 'pending' or 'completed'" });
    }

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      if (!isValidDate(dueDate)) {
        return res.status(400).json({ message: "dueDate is invalid" });
      }
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (title !== undefined) {
      todo.title = title;
    }

    if (description !== undefined) {
      todo.description = description;
    }

    if (status !== undefined) {
      todo.status = status;
    }

    if (dueDate !== undefined) {
      todo.dueDate = dueDate ? new Date(dueDate) : undefined;
    }

    await todo.save();

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update todo" });
  }
};

// Delete a task by _id.
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await todo.deleteOne();

    return res.status(200).json({ message: "Todo deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete todo" });
  }
};

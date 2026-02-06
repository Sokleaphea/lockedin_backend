import { Request, Response } from "express";
import { breakDownTask } from "../services/ai.service";

export async function taskBreakdownController(
  req: Request,
  res: Response
) {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: "Task is required" });
    }

    const breakdown = await breakDownTask(task);

    res.json({
      task,
      breakdown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI task breakdown failed",
    });
  }
}

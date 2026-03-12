import { Request, Response } from "express";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";
import { Types } from "mongoose";

export async function createPomodoroSession(
  req: Request,
  res: Response
) {
  const userId = new Types.ObjectId((req as any).user.id);
  const { type, durationSeconds } = req.body;

  if (typeof durationSeconds !== "number" || durationSeconds <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid duration",
    });
  }

  if (type !== "focus") {
    return res.status(200).json({
      success: true,
      message: "Session ignored (not focus)",
    });
  }

  await PomodoroFocusSessionModel.create({
    userId,
    durationSeconds,
    completedAt: new Date(),
  });

  return res.status(201).json({
    success: true,
    message: "Session saved successfully",
  });
}

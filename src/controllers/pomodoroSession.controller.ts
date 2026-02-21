import { Request, Response } from "express";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";
import { Types } from "mongoose";

// Handles creation of a pomodoro session.
// Only "focus" sessions are saved.
export async function createPomodoroSession(
  req: Request,
  res: Response
) {
// TEMP: hardcoded user ID.
// In production, this will come from auth middleware (req.user.id)
  const userId = new Types.ObjectId((req as any).user.id);

// Extract session type and duration from request body
  const { type, durationSeconds } = req.body;

// Validate duration:
// - Must be a number
// - Must be greater than 0
  if (
    typeof durationSeconds !== "number" ||
    durationSeconds <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid duration",
    });
  }

// Ignore non-focus sessions (e.g. break sessions).
// They are acknowledged but NOT saved.
  if (type !== "focus") {
    return res.status(200).json({
      success: true,
      message: "Session ignored (not focus)",
    });
  }

// Persist the focus session to the database
  await PomodoroFocusSessionModel.create({
    userId,
    durationSeconds,
    completedAt: new Date(), // mark when session was completed
  });

// Send success response
  return res.status(201).json({
    success: true,
    message: "Session saved successfully",
  });
}

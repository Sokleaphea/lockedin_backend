import { Request, Response } from "express";
import { PomodoroFocusSessionModel } from "../models/pomodoroFocusSession.model";
import { Types } from "mongoose";

export async function createPomodoroSession(
    req: Request,
    res: Response
) {
    // provided by auth middleware
    //   const userId = req.user.id;
    const userId = new Types.ObjectId("64f000000000000000000001");

    const { type, durationMinutes } = req.body;

    // 1. Validate duration
    if (
        typeof durationMinutes !== "number" ||
        durationMinutes <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid duration",
        });
    }

    // 2. Ignore non-focus sessions
    if (type !== "focus") {
        return res.status(200).json({
            success: true,
            message: "Session ignored (not focus)",
        });
    }

    // 3. Persist focus session
    await PomodoroFocusSessionModel.create({
        userId,
        durationMinutes,
        completedAt: new Date(),
    });

    // 4. Success response
    return res.status(200).json({
        success: true,
        message: "Session saved successfully",
    });
}

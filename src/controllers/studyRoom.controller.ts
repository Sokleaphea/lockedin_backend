import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { StudyRoom } from "../models/studyRoom.model";

export const getActiveRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await StudyRoom.find({ isActive: true });

    const result = rooms.map((room) => ({
      name: room.name,
      roomId: room.roomId,
      participantCount: room.participants.length,
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch study rooms" });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const name = req.body?.name;
    const userId = req.user!.id;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const roomId = `study-${uuidv4()}`;

    const room = await StudyRoom.create({
      name,
      roomId,
      creator: userId,
      participants: [userId],
      isActive: true,
    });

    return res.status(201).json({
      name: room.name,
      roomId: room.roomId,
      participantCount: room.participants.length,
    });
  } catch (error) {
    console.error("Create study room error:", error);
    return res.status(500).json({ message: "Failed to create study room" });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;

    const room = await StudyRoom.findOne({ roomId, isActive: true });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.participants.length >= 10) {
      return res.status(400).json({ message: "Room is full (max 10 participants)" });
    }

    const alreadyJoined = room.participants.some(
      (p) => p.toString() === userId
    );

    if (!alreadyJoined) {
      room.participants.push(userId as any);
      await room.save();
    }

    return res.status(200).json({
      roomId: room.roomId,
      participantCount: room.participants.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to join study room" });
  }
};

export const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;

    const room = await StudyRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.participants = room.participants.filter(
      (p) => p.toString() !== userId
    ) as typeof room.participants;

    if (room.participants.length === 0) {
      room.isActive = false;
      room.closedAt = new Date();
    }

    await room.save();

    return res.status(200).json({ message: "Successfully left the room" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to leave study room" });
  }
};

import { Request, Response } from "express";
import { Types } from "mongoose";
import { BookFavorite } from "../models/bookFavorite.model";

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const { bookId } = req.body;

    if (!bookId || typeof bookId !== "number") {
      return res.status(400).json({ message: "bookId (number) is required" });
    }

    await BookFavorite.create({ userId, bookId });
    return res.status(201).json({ message: "Book added to favorites" });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Book is already in favorites" });
    }
    return res.status(500).json({ message: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const bookId = Number(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const result = await BookFavorite.findOneAndDelete({ userId, bookId });

    if (!result) {
      return res.status(404).json({ message: "BookFavorite not found" });
    }

    return res.json({ message: "Book removed from favorites" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove favorite" });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const favorites = await BookFavorite.find({ userId }).sort({ createdAt: -1 });
    return res.json(favorites);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch favorites" });
  }
};

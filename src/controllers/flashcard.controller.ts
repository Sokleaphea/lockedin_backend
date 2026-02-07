import { Request, Response } from "express";
import { FlashcardSetModel } from "../models/flashCardSet.model";
import { FlashcardCardModel } from "../models/flashcardCard.model";
import { Types } from "mongoose";

export async function createFlashcardSet(req: Request, res: Response) {
  const userId = new Types.ObjectId("64f000000000000000000001");
  const { title, cards } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ message: "At least one card is required" });
  }

  for (const card of cards) {
    if (!card.front || !card.back) {
      return res
        .status(400)
        .json({ message: "Card front and back are required" });
    }
  }

  const set = await FlashcardSetModel.create({
    userId,
    title,
  });

  const createdCards = await FlashcardCardModel.insertMany(
    cards.map((c) => ({
      flashcardSetId: set._id,
      front: c.front,
      back: c.back,
    }))
  );

  return res.status(201).json({
    _id: set._id,
    title: set.title,
    cards: createdCards,
  });
}

export async function getFlashcardSets(req: Request, res: Response) {
  const userId = new Types.ObjectId("64f000000000000000000001");
  const { search } = req.query;

  const filter: any = { userId };
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const sets = await FlashcardSetModel.find(filter).sort({ updatedAt: -1 });

  const setIds = sets.map((s) => s._id);

  const counts = await FlashcardCardModel.aggregate([
    { $match: { flashcardSetId: { $in: setIds } } },
    { $group: { _id: "$flashcardSetId", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count])
  );

  return res.json(
    sets.map((s) => ({
      _id: s._id,
      title: s.title,
      cardCount: countMap[s._id.toString()] || 0,
      updatedAt: s.updatedAt,
    }))
  );
}

export async function getFlashcardSet(req: Request, res: Response) {
  const userId = new Types.ObjectId("64f000000000000000000001");
  const { id } = req.params;

  const set = await FlashcardSetModel.findOne({
    _id: id,
    userId,
  });

  if (!set) {
    return res.status(404).json({ message: "Flashcard set not found" });
  }

  const cards = await FlashcardCardModel.find({
    flashcardSetId: set._id,
  });

  return res.json({
    _id: set._id,
    title: set.title,
    cards,
  });
}

export async function updateFlashcardSet(req: Request, res: Response) {
  const userId = new Types.ObjectId("64f000000000000000000001");
  const { id } = req.params;
  const { title, addCards, updateCards, deleteCardIds } = req.body;

  const set = await FlashcardSetModel.findOne({ _id: id, userId });
  if (!set) {
    return res.status(404).json({ message: "Flashcard set not found" });
  }

  if (title !== undefined) {
    if (title.trim() === "") {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    set.title = title;
    await set.save();
  }

  if (Array.isArray(addCards)) {
    await FlashcardCardModel.insertMany(
      addCards.map((c) => ({
        flashcardSetId: set._id,
        front: c.front,
        back: c.back,
      }))
    );
  }

  if (Array.isArray(updateCards)) {
    for (const card of updateCards) {
      await FlashcardCardModel.updateOne(
        { _id: card._id, flashcardSetId: set._id },
        { front: card.front, back: card.back }
      );
    }
  }

  if (Array.isArray(deleteCardIds)) {
    await FlashcardCardModel.deleteMany({
      _id: { $in: deleteCardIds },
      flashcardSetId: set._id,
    });
  }

  return res.json({ message: "Flashcard set updated" });
}

export async function deleteFlashcardSet(req: Request, res: Response) {
  const userId = new Types.ObjectId("64f000000000000000000001");
  const { id } = req.params;

  const set = await FlashcardSetModel.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!set) {
    return res.status(404).json({ message: "Flashcard set not found" });
  }

  await FlashcardCardModel.deleteMany({
    flashcardSetId: set._id,
  });

  return res.json({ message: "Flashcard set deleted" });
}

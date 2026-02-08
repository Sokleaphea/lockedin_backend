import { Request, Response } from "express";
import { Types } from "mongoose";
import { FlashcardSetModel } from "../models/flashcardSet.model";
import { FlashcardCardModel } from "../models/flashcardCard.model";
import { FlashcardTestResultModel } from "../models/flashcardTestResult.model";

/**
 * POST /api/flashcards/:id/test-result
 * Save one flashcard test attempt
 */
export async function createFlashcardTestResult(
  req: Request,
  res: Response
) {
  // TEMP userId (JWT later)
  const userId = new Types.ObjectId((req as any).user.id);

  const rawId = req.params.id;

  // ---- Validate ID format ----
  if (Array.isArray(rawId) || !Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      message: "Invalid flashcard set id",
    });
  }

  const flashcardSetId = new Types.ObjectId(rawId);

  const { correctCount, wrongCount, totalCards } = req.body;

  // ---- Validate body ----
  if (
    typeof correctCount !== "number" ||
    typeof wrongCount !== "number" ||
    typeof totalCards !== "number"
  ) {
    return res.status(400).json({
      message: "correctCount, wrongCount, and totalCards must be numbers",
    });
  }

  if (
    correctCount < 0 ||
    wrongCount < 0 ||
    totalCards <= 0 ||
    correctCount + wrongCount !== totalCards
  ) {
    return res.status(400).json({
      message: "Invalid test result counts",
    });
  }

  // ---- Ownership check ----
  const flashcardSet = await FlashcardSetModel.findOne({
    _id: flashcardSetId,
    userId,
  });

  if (!flashcardSet) {
    return res.status(404).json({
      message: "Flashcard set not found",
    });
  }

  // ---- Card count integrity check (NEW) ----
  const actualCardCount = await FlashcardCardModel.countDocuments({
    flashcardSetId,
  });

  if (totalCards > actualCardCount) {
    return res.status(400).json({
      message: "Test card count exceeds available cards in set",
    });
  }

  // ---- Save test result ----
  await FlashcardTestResultModel.create({
    userId,
    flashcardSetId,
    correctCount,
    wrongCount,
    totalCards,
  });

  return res.status(201).json({
    message: "Test result saved successfully",
  });
}

/**
 * GET /api/flashcards/test-results
 * Get all test results for current user
 */
export async function getFlashcardTestResults(
  req: Request,
  res: Response
) {
  const userId = new Types.ObjectId((req as any).user.id);

  const results = await FlashcardTestResultModel
    .find({ userId })
    .sort({ takenAt: -1 });

  return res.json(results);
}

/**
 * GET /api/flashcards/:id/test-results
 * Get test results for a specific flashcard set
 */
export async function getFlashcardTestResultsBySet(
  req: Request,
  res: Response
) {
  const userId = new Types.ObjectId((req as any).user.id);

  const rawId = req.params.id;

  // ---- Validate ID format ----
  if (Array.isArray(rawId) || !Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      message: "Invalid flashcard set id",
    });
  }

  const flashcardSetId = new Types.ObjectId(rawId);

  const results = await FlashcardTestResultModel.find({
    userId,
    flashcardSetId,
  }).sort({ takenAt: -1 });

  return res.json(results);
}

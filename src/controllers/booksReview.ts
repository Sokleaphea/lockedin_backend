import { Request, Response } from "express";
import { Types } from "mongoose";
import { BookReview } from "../models/bookReview.model";

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const bookId = Number(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const { rating, feedback } = req.body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    if (!feedback || typeof feedback !== "string") {
      return res.status(400).json({ message: "Feedback is required" });
    }

    const review = await BookReview.create({ userId, bookId, rating, feedback });
    return res.status(201).json(review);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this book" });
    }
    return res.status(500).json({ message: "Failed to create review" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const reviewId = req.params.reviewId as string;

    if (!Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid reviewId" });
    }

    const review = await BookReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "BookReview not found" });
    }

    if (!review.userId.equals(userId)) {
      return res.status(403).json({ message: "You can only edit your own reviews" });
    }

    const { rating, feedback } = req.body;

    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
      }
      review.rating = rating;
    }

    if (feedback !== undefined) {
      if (typeof feedback !== "string") {
        return res.status(400).json({ message: "Feedback must be a string" });
      }
      review.feedback = feedback;
    }

    await review.save();
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const reviewId = req.params.reviewId as string;

    if (!Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid reviewId" });
    }

    const review = await BookReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "BookReview not found" });
    }

    if (!review.userId.equals(userId)) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await review.deleteOne();
    return res.json({ message: "BookReview deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

export const getBookReviews = async (req: Request, res: Response) => {
  try {
    const bookId = Number(req.params.bookId);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const reviews = await BookReview.find({ bookId })
      .populate("userId", "username displayName avatar")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

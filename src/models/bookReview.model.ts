import { Schema, model, Types } from "mongoose";

export interface BookReview {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: number;
  rating: number;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookReviewSchema = new Schema<BookReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookId: {
      type: Number,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// One review per user per book
bookReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const BookReview = model<BookReview>("BookReview", bookReviewSchema);

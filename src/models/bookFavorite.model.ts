import { Schema, model, Types } from "mongoose";

export interface BookFavorite {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: number;
  createdAt: Date;
}

const bookFavoriteSchema = new Schema<BookFavorite>(
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
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate favorites per user
bookFavoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const BookFavorite = model<BookFavorite>("BookFavorite", bookFavoriteSchema);

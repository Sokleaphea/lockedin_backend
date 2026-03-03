import { Request, Response } from "express";
import { fetchBooks } from "../services/book.service";

export const getBooks = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const books = await fetchBooks(search, category);
    return res.json(books);
  } catch (error: any) {
    console.error("❌ Book fetch error:", error.message, error);
    if (error.response || error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({ message: "Book service is temporarily unavailable" });
    }
    return res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
};

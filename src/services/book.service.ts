import axios from "axios";
import {
  getBooksCacheKey,
  getCachedBooks,
  setCachedBooks,
  getCachedCategories,
  setCachedCategories,
} from "../utils/bookCache";
import { normalizeCategories } from "../utils/bookCategoriesNormalization";

const GUTENDEX_BASE_URL = "https://gutendex.com/books";

export const fetchBooks = async (
  search?: string,
  category?: string
) => {
  try {
    const now = Date.now();
    const cacheKey = getBooksCacheKey(search, category);
    const cached = getCachedBooks(cacheKey, now);
    if (cached) return cached;

    const response = await axios.get(GUTENDEX_BASE_URL, {
      params: {
        search,
        topic: category,
      },
    });

    const books = response.data.results;

    const mappedBooks = books.map((book: any) => ({
      id: book.id,
      title: book.title,
      authors: book.authors?.map((a: any) => a.name) || [],
      summary: book.summaries?.[0] || "No summary available",
      categories: book.subjects || [],
      downloadCount: book.download_count,
      formats: book.formats,
    }));

    setCachedBooks(cacheKey, mappedBooks, now);

    return mappedBooks;
  } catch (error: any) {
    console.error("❌ Gutendex API error:", error.message);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const now = Date.now();
    const cached = getCachedCategories(now);
    if (cached) return cached;

    const response = await axios.get(GUTENDEX_BASE_URL);
    const books = response.data.results;

    // Collect all raw subjects
    const allSubjects: string[] = [];
    books.forEach((book: any) => {
      if (book.subjects) allSubjects.push(...book.subjects);
    });

    const normalizedCategories = normalizeCategories(allSubjects);
    setCachedCategories(normalizedCategories, now);

    return normalizedCategories;
  } catch (error: any) {
    console.error("❌ Gutendex categories fetch error:", error.message);
    throw error;
  }
};
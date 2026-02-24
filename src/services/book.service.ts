import axios from "axios";
import NodeCache from "node-cache";

const GUTENDEX_BASE_URL = "https://gutendex.com/books";
const cache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

export interface BookResult {
  id: number;
  title: string;
  authors: string[];
  summary: string;
  categories: string[];
  downloadCount: number;
}

interface GutendexAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  subjects: string[];
  bookshelves: string[];
  download_count: number;
}

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

function transformBook(book: GutendexBook): BookResult {
  return {
    id: book.id,
    title: book.title,
    authors: book.authors.map((a) => a.name),
    summary: book.subjects.join(", ") || "No summary available",
    categories: [...new Set([...book.subjects, ...book.bookshelves])],
    downloadCount: book.download_count,
  };
}

function filterByCategory(
  books: GutendexBook[],
  category: string
): GutendexBook[] {
  const lower = category.toLowerCase();
  return books.filter(
    (book) =>
      book.subjects.some((s) => s.toLowerCase().includes(lower)) ||
      book.bookshelves.some((b) => b.toLowerCase().includes(lower))
  );
}

export async function fetchBooks(
  search?: string,
  category?: string
): Promise<BookResult[]> {
  const cacheKey = `books:${search || ""}:${category || ""}`;
  const cached = cache.get<BookResult[]>(cacheKey);
  if (cached) return cached;

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (category && !search) params.topic = category;

  const response = await axios.get<GutendexResponse>(GUTENDEX_BASE_URL, {
    params,
    timeout: 10000,
  });

  let books = response.data.results;

  // If both search and category are provided, filter locally since
  // Gutendex doesn't support combined search + topic filtering
  if (search && category) {
    books = filterByCategory(books, category);
  }

  const results = books.map(transformBook);
  cache.set(cacheKey, results);
  return results;
}

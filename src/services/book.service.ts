import axios from "axios";

const GUTENDEX_BASE_URL = "https://gutendex.com/books";

// Cache for categories
let categoriesCache: string[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Normalizes raw Gutendex subjects into clean, broad genre categories.
 * - Removes character-specific entries (e.g. "Ahab, Captain (Fictitious character) -- Fiction")
 * - Removes location-specific entries (e.g. "London (England) -- Fiction")
 * - Removes person name entries (e.g. "Wagner, Richard, 1813-1883")
 * - Strips sub-classifications after " -- " keeping the broad genre base
 */
const normalizeCategories = (subjects: string[]): string[] => {
  const result = new Set<string>();

  for (const subject of subjects) {
    // Skip character-specific entries
    if (subject.includes("(Fictitious character")) continue;

    if (subject.includes(" -- ")) {
      const basePart = subject.split(" -- ")[0].trim();

      // Skip location patterns like "London (England)" or "Paris (France)"
      if (/\([A-Z][a-z]+\)/.test(basePart)) continue;

      // Skip person name patterns like "Ahab, Captain" or "Wagner, Richard"
      if (/^[A-Z][a-zA-Z]+, [A-Z]/.test(basePart)) continue;

      result.add(basePart);
    } else {
      // Skip person name with birth year like "Wagner, Richard, 1813-1883"
      if (/^[A-Z][a-zA-Z]+, [A-Z][a-z]+ \d{4}/.test(subject)) continue;

      result.add(subject);
    }
  }

  return Array.from(result).sort();
};

export const fetchBooks = async (
  search?: string,
  category?: string
) => {
  try {
    const response = await axios.get(GUTENDEX_BASE_URL, {
      params: {
        search,
        topic: category,
      },
    });

    const books = response.data.results;

    return books.map((book: any) => ({
      id: book.id,
      title: book.title,
      authors: book.authors?.map((a: any) => a.name) || [],
      summary: book.summaries?.[0] || "No summary available",
      categories: book.subjects || [],
      downloadCount: book.download_count,
      formats: book.formats,
    }));
  } catch (error: any) {
    console.error("❌ Gutendex API error:", error.message);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    // Return cached result if still valid
    const now = Date.now();
    if (categoriesCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
      return categoriesCache;
    }

    const response = await axios.get(GUTENDEX_BASE_URL);
    const books = response.data.results;

    // Collect all raw subjects
    const allSubjects: string[] = [];
    books.forEach((book: any) => {
      if (book.subjects) allSubjects.push(...book.subjects);
    });

    // Normalize, deduplicate, and cache
    categoriesCache = normalizeCategories(allSubjects);
    cacheTimestamp = now;

    return categoriesCache;
  } catch (error: any) {
    console.error("❌ Gutendex categories fetch error:", error.message);
    throw error;
  }
};
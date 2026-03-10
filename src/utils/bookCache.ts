const BOOKS_CACHE_DURATION_MS = 1000 * 60 * 10; // 10 minutes
const CATEGORIES_CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

const booksCache = new Map<string, { data: any[]; timestamp: number }>();
let categoriesCache: string[] | null = null;
let categoriesCacheTimestamp: number | null = null;

export const getBooksCacheKey = (search?: string, category?: string): string => {
  const normalizedSearch = (search ?? "").trim().toLowerCase();
  const normalizedCategory = (category ?? "").trim().toLowerCase();
  return `${normalizedSearch}::${normalizedCategory}`;
};

const cleanupBooksCache = (now: number) => {
  for (const [key, entry] of booksCache.entries()) {
    if (now - entry.timestamp >= BOOKS_CACHE_DURATION_MS) {
      booksCache.delete(key);
    }
  }
};

export const getCachedBooks = (key: string, now: number): any[] | null => {
  const cached = booksCache.get(key);
  if (!cached) return null;

  if (now - cached.timestamp >= BOOKS_CACHE_DURATION_MS) {
    booksCache.delete(key);
    return null;
  }

  return cached.data;
};

export const setCachedBooks = (key: string, data: any[], now: number) => {
  booksCache.set(key, { data, timestamp: now });
  cleanupBooksCache(now);
};

export const getCachedCategories = (now: number): string[] | null => {
  if (!categoriesCache || !categoriesCacheTimestamp) return null;

  if (now - categoriesCacheTimestamp >= CATEGORIES_CACHE_DURATION_MS) {
    categoriesCache = null;
    categoriesCacheTimestamp = null;
    return null;
  }

  return categoriesCache;
};

export const setCachedCategories = (categories: string[], now: number) => {
  categoriesCache = categories;
  categoriesCacheTimestamp = now;
};

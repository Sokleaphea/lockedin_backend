import axios from "axios";

const GUTENDEX_BASE_URL = "https://gutendex.com/books";

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
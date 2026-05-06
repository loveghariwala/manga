import { MangaCard, MangaDetail, ChapterItem, ReaderPage } from "@/types";

export interface MangaProvider {
  /**
   * Unique identifier for the provider (e.g., 'mangadex', 'mangakakalot')
   */
  id: string;
  
  /**
   * Display name of the provider
   */
  name: string;

  /**
   * Search for manga by title or query
   */
  searchManga(query: string, limit?: number, offset?: number): Promise<{ data: MangaCard[], total: number }>;

  /**
   * Get latest uploaded chapters across the platform
   */
  getLatestUpdates(limit?: number, offset?: number): Promise<MangaCard[]>;

  /**
   * Get trending or most popular manga
   */
  getTrendingManga(limit?: number, offset?: number): Promise<MangaCard[]>;

  /**
   * Get recently added manga to the platform
   */
  getNewAdditions(limit?: number, offset?: number): Promise<MangaCard[]>;

  /**
   * Get detailed metadata for a specific manga
   */
  getMangaDetail(id: string): Promise<MangaDetail>;

  /**
   * Get the list of chapters for a specific manga
   */
  getMangaChapters(id: string, offset?: number, limit?: number): Promise<{ data: ChapterItem[], total: number }>;

  /**
   * Get the image URLs for a specific chapter
   */
  getChapterPages(chapterId: string): Promise<ReaderPage[]>;
}

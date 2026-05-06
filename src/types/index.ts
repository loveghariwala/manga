export type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled";

export interface MangaCard {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  status: MangaStatus;
  tags: string[];
  lastChapter?: string;
  rating?: number;
}

export interface MangaDetail extends MangaCard {
  author: string;
  artist: string;
  altTitles: string[];
  chaptersCount: number;
  year?: number;
}

export interface ChapterItem {
  id: string;
  title: string;
  chapterNumber: string;
  volumeNumber?: string;
  language: string;
  publishAt: string;
  scanlationGroup?: string;
}

export interface ReaderPage {
  url: string;
  pageNumber: number;
}

export interface UserLibraryEntry {
  mangaId: string;
  status: "reading" | "completed" | "on_hold" | "dropped" | "plan_to_read";
  progress: number; // last read chapter index or ID
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    offset?: number;
    limit?: number;
  };
}

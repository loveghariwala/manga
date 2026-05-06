import axios from "axios";
import { MangaCard, MangaDetail, ChapterItem, ReaderPage, MangaStatus } from "@/types";
import { getDb } from "../mongodb"; // Updated relative path
import { MangaProvider } from "./types";
import { anilist } from "../anilist";

const MANGADEX_API = "https://api.mangadex.org";
const MANGADEX_UPLOADS = "https://uploads.mangadex.org";

export class MangaDexProvider implements MangaProvider {
  public id = "mangadex";
  public name = "MangaDex";

  async searchManga(query: string, limit: number = 24, offset: number = 0): Promise<{ data: MangaCard[], total: number }> {
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        title: query,
        limit,
        offset,
        includes: ["cover_art", "author", "artist"],
        "contentRating[]": ["safe", "suggestive"],
      },
    });

    const total = response.data.total;
    const data = response.data.data.map((m: any) => this.normalizeManga(m));
    return { data, total };
  }

  async getLatestUpdates(limit: number = 24, offset: number = 0): Promise<MangaCard[]> {
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit,
        offset,
        includes: ["cover_art"],
        order: { latestUploadedChapter: "desc" },
        "contentRating[]": ["safe", "suggestive"],
      },
    });
    return response.data.data.map((m: any) => this.normalizeManga(m));
  }

  async getTrendingManga(limit: number = 24, offset: number = 0): Promise<MangaCard[]> {
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit,
        offset,
        includes: ["cover_art"],
        order: { followedCount: "desc" },
        "contentRating[]": ["safe", "suggestive"],
      },
    });
    return response.data.data.map((m: any) => this.normalizeManga(m));
  }

  async getNewAdditions(limit: number = 24, offset: number = 0): Promise<MangaCard[]> {
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit,
        offset,
        includes: ["cover_art"],
        order: { createdAt: "desc" },
        "contentRating[]": ["safe", "suggestive"],
      },
    });
    return response.data.data.map((m: any) => this.normalizeManga(m));
  }

  async getMangaDetail(id: string): Promise<MangaDetail> {
    const db = await getDb();
    const cache = db.collection("manga_cache");

    const cached = await cache.findOne({ mangaId: id });
    if (cached && (cached.expiresAt as Date) > new Date()) {
      return cached.data as MangaDetail;
    }

    const response = await axios.get(`${MANGADEX_API}/manga/${id}`, {
      params: {
        includes: ["cover_art", "author", "artist"],
      },
    });
    
    // Normalize base MangaDex data
    let normalized = this.normalizeMangaDetail(response.data.data);

    // Phase 2: Metadata Enrichment via AniList
    try {
      const links = response.data.data?.attributes?.links || {};
      const aniListId = links.al;
      
      const enrichment = await anilist.getMetadata({
        id: aniListId,
        title: !aniListId ? normalized.title : undefined
      });

      if (enrichment) {
        normalized = {
          ...normalized,
          anilistId: enrichment.id,
          bannerImage: enrichment.bannerImage,
          averageScore: enrichment.averageScore,
          popularity: enrichment.popularity,
          richDescription: enrichment.description,
          // If MangaDex cover is missing or we want high-res, we could override coverUrl
          // coverUrl: enrichment.coverImage || normalized.coverUrl
        };
      }
    } catch (e) {
      console.warn("Failed to enrich metadata with AniList");
    }

    // Cache for 24 hours
    await cache.updateOne(
      { mangaId: id },
      {
        $set: {
          mangaId: id,
          data: normalized,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      },
      { upsert: true }
    );

    return normalized;
  }

  async getMangaChapters(id: string, offset: number = 0, limit: number = 500): Promise<{ data: ChapterItem[], total: number }> {
    const response = await axios.get(`${MANGADEX_API}/manga/${id}/feed`, {
      params: {
        limit,
        offset,
        translatedLanguage: ["en"],
        order: { chapter: "desc" },
        includes: ["scanlation_group"],
        "contentRating[]": ["safe", "suggestive", "erotica"],
      },
    });

    const rawData = response.data.data.map((c: any) => ({
      id: c.id,
      title: c.attributes.title || "",
      chapterNumber: c.attributes.chapter,
      volumeNumber: c.attributes.volume,
      language: c.attributes.translatedLanguage,
      publishAt: c.attributes.publishAt,
      scanlationGroup: c.relationships.find((r: any) => r.type === "scanlation_group")?.attributes?.name,
    }));

    // Deduplicate by chapter number
    const seen = new Set();
    const data = rawData.filter((c: any) => {
      if (!c.chapterNumber || seen.has(c.chapterNumber)) return false;
      seen.add(c.chapterNumber);
      return true;
    });

    return { data, total: response.data.total };
  }

  async getChapterPages(chapterId: string): Promise<ReaderPage[]> {
    const response = await axios.get(`${MANGADEX_API}/at-home/server/${chapterId}`);
    const hash = response.data.chapter.hash;
    const pages = response.data.chapter.data;
    const baseUrl = response.data.baseUrl;

    return pages.map((page: string, index: number) => ({
      url: `${baseUrl}/data/${hash}/${page}`,
      pageNumber: index + 1,
    }));
  }

  normalizeManga(m: any): MangaCard {
    const coverRel = m.relationships.find((r: any) => r.type === "cover_art");
    const coverFile = coverRel?.attributes?.fileName;
    const coverUrl = coverFile ? `${MANGADEX_UPLOADS}/covers/${m.id}/${coverFile}.256.jpg` : "/placeholder-cover.jpg";

    return {
      id: m.id,
      title: m.attributes.title.en || Object.values(m.attributes.title)[0] || "Unknown Title",
      description: m.attributes.description.en || "",
      coverUrl,
      status: m.attributes.status as MangaStatus,
      tags: m.attributes.tags.map((t: any) => t.attributes.name.en),
      lastChapter: m.attributes.lastChapter || m.attributes.latestUploadedChapter,
    };
  }

  normalizeMangaDetail(m: any): MangaDetail {
    const base = this.normalizeManga(m);
    const author = m.relationships.find((r: any) => r.type === "author")?.attributes?.name || "Unknown";
    const artist = m.relationships.find((r: any) => r.type === "artist")?.attributes?.name || author;

    return {
      ...base,
      author,
      artist,
      altTitles: m.attributes.altTitles.map((t: any) => Object.values(t)[0]),
      chaptersCount: 0, // Need to fetch separately or use statistics API
      year: m.attributes.year,
    };
  }
}

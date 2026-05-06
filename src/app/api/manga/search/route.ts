import { NextRequest, NextResponse } from "next/server";
import { mangadex } from "@/lib/mangadex";
import { cache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const cacheKey = `manga:search:${q}:${limit}:${offset}`;
  
  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const result = await mangadex.searchManga(q, limit, offset);
    
    // Cache for 10 minutes
    await cache.set(cacheKey, result, 600);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch manga" }, { status: 500 });
  }
}

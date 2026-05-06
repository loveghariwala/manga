import { NextRequest, NextResponse } from "next/server";
import { mangadex } from "@/lib/mangadex";
import { cache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "100");

  const cacheKey = `manga:chapters:${id}:${offset}:${limit}`;

  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return NextResponse.json(cachedData);

    const result = await mangadex.getMangaChapters(id, offset, limit);
    
    // Cache for 30 minutes
    await cache.set(cacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 });
  }
}

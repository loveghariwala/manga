import { NextRequest, NextResponse } from "next/server";
import { mangadex } from "@/lib/mangadex";
import { cache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cacheKey = `manga:detail:${id}`;

  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return NextResponse.json(cachedData);

    const result = await mangadex.getMangaDetail(id);
    
    // Cache for 1 hour
    await cache.set(cacheKey, result, 3600);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch manga detail" }, { status: 500 });
  }
}

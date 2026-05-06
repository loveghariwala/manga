import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mangaId = searchParams.get("mangaId");

  if (!mangaId) {
    return NextResponse.json({ error: "Manga ID required" }, { status: 400 });
  }

  const db = await getDb();
  const userId = (session.user as any).id;
  const progress = await db.collection("progress").findOne({ userId, mangaId });
  
  return NextResponse.json(progress || { pageNumber: 1 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mangaId, chapterId, pageNumber } = await req.json();
  const userId = (session.user as any).id;

  const db = await getDb();

  try {
    const result = await db.collection("progress").findOneAndUpdate(
      { userId, mangaId },
      { $set: { chapterId, pageNumber, updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

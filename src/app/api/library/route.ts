import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const userId = (session.user as any).id;
  const entries = await db.collection("library").find({ userId }).toArray();
  
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mangaId, status } = await req.json();
  const userId = (session.user as any).id;

  const db = await getDb();

  try {
    const result = await db.collection("library").findOneAndUpdate(
      { userId, mangaId },
      { $set: { status, updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Library update error:", error);
    return NextResponse.json({ error: "Failed to update library" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await req.json();
    const db = await getDb();
    const userId = (session.user as any).id;

    console.log(`📝 Attempting to update user: ${userId}`);

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name, image, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      console.error(`❌ No user found with ID: ${userId}`);
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    console.log(`✅ Successfully updated user: ${userId}`);
    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

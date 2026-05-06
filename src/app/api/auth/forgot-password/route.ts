import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const db = await getDb();

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // In a real app, you would generate a token and send an email here.
    // For this demo, we'll just log it and return success.
    console.log(`🔑 Password reset requested for: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: "If an account exists, a reset link has been sent." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

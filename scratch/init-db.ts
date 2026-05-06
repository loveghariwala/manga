import { getDb } from "../src/lib/mongodb";

async function initDb() {
  try {
    const db = await getDb();
    
    // Create TTL index for manga_cache (expires data based on expiresAt field)
    await db.collection("manga_cache").createIndex(
      { expiresAt: 1 }, 
      { expireAfterSeconds: 0 }
    );
    
    // Create unique index for users email
    await db.collection("users").createIndex(
      { email: 1 }, 
      { unique: true }
    );

    console.log("✅ Database indexes initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize indexes:", error);
    process.exit(1);
  }
}

initDb();

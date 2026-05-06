import { getDb } from "./mongodb";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await getDb();
      const doc = await db.collection("manga_cache").findOne({ key });
      
      // Check if it exists and hasn't expired
      if (doc && doc.expiresAt > new Date()) {
        return doc.value as T;
      }
      return null;
    } catch (e) {
      console.error("Cache get error:", e);
      return null;
    }
  },
  
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const db = await getDb();
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      
      await db.collection("manga_cache").updateOne(
        { key },
        { $set: { key, value, expiresAt } },
        { upsert: true }
      );
    } catch (e) {
      console.error("Cache set error:", e);
    }
  },
  
  async del(key: string): Promise<void> {
    try {
      const db = await getDb();
      await db.collection("manga_cache").deleteOne({ key });
    } catch (e) {
      console.error("Cache del error:", e);
    }
  },
};

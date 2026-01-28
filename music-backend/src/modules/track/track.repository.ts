import { db } from "../../config/db";
import { tracks } from "../../database/schema";
import { ilike, or, desc } from "drizzle-orm";

export class TrackRepository {
  async findAll(limit = 50) {
    return db
      .select()
      .from(tracks)
      .orderBy(desc(tracks.createdAt))
      .limit(limit);
  }

  async search(query: string, limit = 50) {
    const searchPattern = `%${query}%`;
    
    return db
      .select()
      .from(tracks)
      .where(
        or(
          ilike(tracks.title, searchPattern),
          ilike(tracks.artist, searchPattern),
          ilike(tracks.album, searchPattern)
        )
      )
      .orderBy(desc(tracks.playCount))
      .limit(limit);
  }

  async findById(trackId: string) {
    const [track] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, trackId))
      .limit(1);
    
    return track ?? null;
  }
}

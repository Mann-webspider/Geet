import { db } from "../../config/db";
import { tracks } from "../../database/schema";
import { ilike, or, desc, eq } from "drizzle-orm";

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
    async getById(id: string) {
    const [row] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, id))
      .limit(1);
    return row ?? null;
  }

  async updateTrack(
    id: string,
    data: Partial<{
      title: string;
      artist: string;
      album: string | null;
      genre: string | null;
      duration: number | null;
      isExplicit: boolean;
      coverArtUrl: string | null;
    }>
  ) {
    const [updated] = await db
      .update(tracks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, id))
      .returning();
    return updated ?? null;
  }
}

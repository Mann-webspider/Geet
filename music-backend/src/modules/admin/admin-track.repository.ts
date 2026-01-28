import { db } from "../../config/db";
import { tracks } from "../../database/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

export class AdminTrackRepository {
  async createTrack(input: {
    title: string;
    artist: string;
    album?: string;
    duration: number;
    fileUrl: string;
    coverArtUrl?: string;
    genre?: string;
    releaseYear?: number;
    isExplicit?: boolean;
  }) {
    const [track] = await db.insert(tracks).values(input).returning();
    return track;
  }

  async updateTrack(
    trackId: string,
    updates: Partial<{
      title: string;
      artist: string;
      album: string;
      duration: number;
      fileUrl: string;
      coverArtUrl: string;
      genre: string;
      releaseYear: number;
      isExplicit: boolean;
    }>
  ) {
    const [updated] = await db
      .update(tracks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tracks.id, trackId))
      .returning();
    return updated;
  }

  async deleteTrack(trackId: string) {
    const [deleted] = await db
      .delete(tracks)
      .where(eq(tracks.id, trackId))
      .returning();
    return deleted;
  }

  async listTracks(params: { limit?: number; offset?: number; search?: string }) {
    let query = db.select().from(tracks);

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      query = query.where(
        or(
          ilike(tracks.title, searchPattern),
          ilike(tracks.artist, searchPattern),
          ilike(tracks.album, searchPattern)
        )
      ) as any;
    }

    return query
      .orderBy(desc(tracks.createdAt))
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);
  }

  async getTrackById(trackId: string) {
    const [track] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, trackId))
      .limit(1);
    return track ?? null;
  }
}

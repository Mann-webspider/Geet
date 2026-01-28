import { db } from "../../config/db";
import { listenHistory, tracks } from "../../database/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export class ListenRepository {
  async recordListen(input: {
    userId: string;
    trackId: string;
    playlistId?: string | null;
    completionPercentage?: number;
    duration?: number;
    platform?: string;
    deviceId?: string;
  }) {
    const [record] = await db
      .insert(listenHistory)
      .values({
        userId: input.userId,
        trackId: input.trackId,
        playlistId: input.playlistId ?? null,
        completionPercentage: input.completionPercentage ?? 0,
        duration: input.duration ?? 0,
        platform: input.platform ?? null,
        deviceId: input.deviceId ?? null,
      })
      .returning();

    // Increment track play count if completion >= 30%
    if ((input.completionPercentage ?? 0) >= 30) {
      await db
        .update(tracks)
        .set({
          playCount: sql`${tracks.playCount} + 1`,
        })
        .where(eq(tracks.id, input.trackId));
    }

    return record;
  }

  async getUserListenHistory(userId: string, limit = 50) {
    return db
      .select({
        id: listenHistory.id,
        listenedAt: listenHistory.listenedAt,
        completionPercentage: listenHistory.completionPercentage,
        duration: listenHistory.duration,
        track: {
          id: tracks.id,
          title: tracks.title,
          artist: tracks.artist,
          album: tracks.album,
          duration: tracks.duration,
          coverArtUrl: tracks.coverArtUrl,
        },
      })
      .from(listenHistory)
      .innerJoin(tracks, eq(listenHistory.trackId, tracks.id))
      .where(eq(listenHistory.userId, userId))
      .orderBy(desc(listenHistory.listenedAt))
      .limit(limit);
  }

  async getRecentlyPlayed(userId: string, limit = 20) {
    // Get unique tracks user recently played
    return db
      .selectDistinctOn([listenHistory.trackId], {
        listenedAt: listenHistory.listenedAt,
        track: {
          id: tracks.id,
          title: tracks.title,
          artist: tracks.artist,
          album: tracks.album,
          duration: tracks.duration,
          coverArtUrl: tracks.coverArtUrl,
        },
      })
      .from(listenHistory)
      .innerJoin(tracks, eq(listenHistory.trackId, tracks.id))
      .where(eq(listenHistory.userId, userId))
      .orderBy(listenHistory.trackId, desc(listenHistory.listenedAt))
      .limit(limit);
  }
}

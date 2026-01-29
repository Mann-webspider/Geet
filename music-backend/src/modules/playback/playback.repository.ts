import { db } from "../../config/db";
import { playbackEvents, tracks } from "../../database/schema";
import { eq, desc, sql, and, gt } from "drizzle-orm";

export class PlaybackRepository {
  async createPlaybackEvent(input: {
    userId: string;
    trackId: string;
    source?: string;
  }) {
    const [row] = await db
      .insert(playbackEvents)
      .values({
        userId: input.userId,
        trackId: input.trackId,
        source: input.source ?? "unknown",
        startedAt: new Date(),
      })
      .returning();

    return row;
  }

  async incrementTrackPlayCount(trackId: string) {
    // Assumes tracks table has playCount column.
    await db
      .update(tracks)
      .set({
        playCount: sql`${tracks.playCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, trackId));
  }

  async getTrackById(trackId: string) {
    const [row] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, trackId))
      .limit(1);

    return row ?? null;
  }

  async findRecentPlayed(params: {
    userId: string;
    limit: number;
    offset: number;
  }) {
    // Distinct-by-track is optional; this returns actual events ordered by time.
    const rows = await db
      .select({
        eventId: playbackEvents.id,
        playedAt: playbackEvents.startedAt,
        source: playbackEvents.source,

        trackId: tracks.id,
        title: tracks.title,
        artist: tracks.artist,
        album: tracks.album,
        duration: tracks.duration,
        genre: tracks.genre,
        isExplicit: tracks.isExplicit,
        playCount: tracks.playCount,
        fileUrl: tracks.fileUrl,
        coverArtUrl: tracks.coverArtUrl,
        createdAt: tracks.createdAt,
      })
      .from(playbackEvents)
      .innerJoin(tracks, eq(playbackEvents.trackId, tracks.id))
      .where(eq(playbackEvents.userId, params.userId))
      .orderBy(desc(playbackEvents.startedAt))
      .limit(params.limit)
      .offset(params.offset);

    return rows;
  }

  async findRecentDuplicateWithinSeconds(input: {
    userId: string;
    trackId: string;
    seconds: number;
  }) {
    // Optional debounce (avoid double-counting if user hits play multiple times).
    const cutoff = new Date(Date.now() - input.seconds * 1000);

    const [row] = await db
      .select({ id: playbackEvents.id })
      .from(playbackEvents)
      .where(
        and(
          eq(playbackEvents.userId, input.userId),
          eq(playbackEvents.trackId, input.trackId),
          gt(playbackEvents.startedAt, cutoff)
        )
      )
      .orderBy(desc(playbackEvents.startedAt))
      .limit(1);

    return row ?? null;
  }
}

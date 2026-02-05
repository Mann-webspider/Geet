import { db } from "../../config/db";
import { musicRequests, tracks, users } from "../../database/schema";
import { and, desc, eq } from "drizzle-orm";

export type MusicRequestStatus =
  | "submitted"
  | "in_review"
  | "in_progress"
  | "completed"
  | "rejected";

export class MusicRequestRepository {
  async create(input: {
    userId: string;
    songTitle: string;
    artistName: string;
    albumName?: string | null;
    notes?: string | null;
    priority?: "low" | "normal" | "high";
  }) {
    const [created] = await db
      .insert(musicRequests)
      .values({
        userId: input.userId,
        songTitle: input.songTitle.trim(),
        artistName: input.artistName.trim(),
        albumName: input.albumName?.trim() ?? null,
        notes: input.notes?.trim() ?? null,
        priority: input.priority ?? "normal",
        status: "submitted",
      })
      .returning();

    return created;
  }

  async listForUser(params: {
    userId: string;
    status?: MusicRequestStatus;
    limit?: number;
    offset?: number;
  }) {
    let q = db
      .select({
        request: musicRequests,
        track: {
          id: tracks.id,
          title: tracks.title,
          artist: tracks.artist,
          coverArtUrl: tracks.coverArtUrl,
          fileUrl: tracks.fileUrl,
        },
      })
      .from(musicRequests)
      .leftJoin(tracks, eq(musicRequests.resolvedTrackId, tracks.id))
      .where(eq(musicRequests.userId, params.userId));

    if (params.status) {
      q = q.where(
        and(
          eq(musicRequests.userId, params.userId),
          eq(musicRequests.status, params.status),
        ),
      ) as any;
    }

    return q
      .orderBy(desc(musicRequests.createdAt))
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);
  }

  async getByIdForUser(input: { id: string; userId: string }) {
    const [row] = await db
      .select({
        request: musicRequests,
        track: tracks,
      })
      .from(musicRequests)
      .leftJoin(tracks, eq(musicRequests.resolvedTrackId, tracks.id))
      .where(
        and(
          eq(musicRequests.id, input.id),
          eq(musicRequests.userId, input.userId),
        ),
      )
      .limit(1);

    return row ?? null;
  }
}

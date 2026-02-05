import { db } from "../../config/db";
import { musicRequests, tracks, users } from "../../database/schema";
import { and, desc, eq } from "drizzle-orm";

export type AdminMusicRequestStatus =
  | "submitted"
  | "in_review"
  | "in_progress"
  | "completed"
  | "rejected";

export class AdminMusicRequestRepository {
  async list(params: {
    status?: AdminMusicRequestStatus;
    limit?: number;
    offset?: number;
  }) {
    let q = db
      .select({
        request: musicRequests,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
        track: {
          id: tracks.id,
          title: tracks.title,
          artist: tracks.artist,
        },
      })
      .from(musicRequests)
      .leftJoin(users, eq(musicRequests.userId, users.id))
      .leftJoin(tracks, eq(musicRequests.resolvedTrackId, tracks.id));

    if (params.status) {
      q = q.where(eq(musicRequests.status, params.status)) as any;
    }

    return q
      .orderBy(desc(musicRequests.createdAt))
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);
  }

  async getById(id: string) {
    const [row] = await db
      .select({
        request: musicRequests,
        user: users,
        track: tracks,
      })
      .from(musicRequests)
      .leftJoin(users, eq(musicRequests.userId, users.id))
      .leftJoin(tracks, eq(musicRequests.resolvedTrackId, tracks.id))
      .where(eq(musicRequests.id, id))
      .limit(1);

    return row ?? null;
  }

  async update(
    id: string,
    updates: Partial<{
      status: AdminMusicRequestStatus;
      adminNote: string | null;
      resolvedTrackId: string | null;
      resolvedAt: Date | null;
    }>,
  ) {
    const [row] = await db
      .update(musicRequests)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(musicRequests.id, id))
      .returning();

    return row ?? null;
  }
}

import { db } from "../../config/db";
import { playlists, playlistTracks, playbackEvents, tracks } from "../../database/schema";
import { and, eq, desc, sql, gt } from "drizzle-orm";

export class EditorialPlaylistRepository {
  async createEditorialPlaylist(input: {
    name: string;
    description?: string | null;
    coverArtUrl?: string | null;
    priority?: number;
    visibleOnHome?: boolean;
    editorialType?: "home_curated" | "trending" | null;
    createdByAdminId: string;
  }) {
    const [row] = await db
      .insert(playlists)
      .values({
        name: input.name,
        description: input.description ?? null,
        coverArtUrl: input.coverArtUrl ?? null,
        isEditorial: true,
        editorialType: input.editorialType ?? "home_curated",
        visibleOnHome: input.visibleOnHome ?? true,
        priority: input.priority ?? 0,
        // if you have ownerId/userId, set it to admin or a system user
        ownerId: input.createdByAdminId,
      })
      .returning();

    return row;
  }

  async updateEditorialPlaylist(
    playlistId: string,
    data: Partial<{
      name: string;
      description: string | null;
      coverArtUrl: string | null;
      visibleOnHome: boolean;
      priority: number;
    }>
  ) {
    const [row] = await db
      .update(playlists)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(playlists.id, playlistId), eq(playlists.isEditorial, true)))
      .returning();

    return row ?? null;
  }

  async setPlaylistTracks(playlistId: string, trackIds: string[]) {
    // remove old
    await db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));

    if (!trackIds.length) return;

    // insert new
    await db.insert(playlistTracks).values(
      trackIds.map((trackId, index) => ({
        playlistId,
        trackId,
        order: index,
      }))
    );
  }

  async getEditorialPlaylistsForHome() {
    return db
      .select()
      .from(playlists)
      .where(and(eq(playlists.isEditorial, true), eq(playlists.visibleOnHome, true)))
      .orderBy(desc(playlists.priority));
  }

  async getOrCreateTrendingPlaylist(createdByAdminId: string) {
    const [existing] = await db
      .select()
      .from(playlists)
      .where(
        and(
          eq(playlists.isEditorial, true),
          eq(playlists.editorialType, "trending")
        )
      )
      .limit(1);

    if (existing) return existing;

    return this.createEditorialPlaylist({
      name: "Trending Now",
      description: "Most listened tracks recently",
      editorialType: "trending",
      visibleOnHome: true,
      priority: 100,
      createdByAdminId,
    });
  }

  async computeTrendingTracks(input: { windowHours: number; limit: number }) {
    const cutoff = new Date(Date.now() - input.windowHours * 60 * 60 * 1000);

    // basic aggregation: count playback events per track in time window
    const rows = await db
      .select({
        trackId: playbackEvents.trackId,
        listens: sql<number>`COUNT(*)`,
      })
      .from(playbackEvents)
      .where(gt(playbackEvents.startedAt, cutoff))
      .groupBy(playbackEvents.trackId)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(input.limit);

    return rows.map((r) => r.trackId);
  }
}

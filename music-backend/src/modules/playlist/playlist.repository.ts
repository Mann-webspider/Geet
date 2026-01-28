import { db } from "../../config/db";
import { playlists,playlistTracks, tracks } from "../../database/schema";
import { and, eq, sql } from "drizzle-orm";

export class PlaylistRepository {
  async findByOwner(userId: string) {
    return db
      .select({
        id: playlists.id,
        name: playlists.name,
        description: playlists.description,
        isCollaborative: playlists.isCollaborative,
        isPublic: playlists.isPublic,
        coverArtUrl: playlists.coverArtUrl,
        trackCount: playlists.trackCount,
        totalDuration: playlists.totalDuration,
        createdAt: playlists.createdAt,
      })
      .from(playlists)
      .where(eq(playlists.creatorId, userId));
  }

  async createForUser(userId: string, input: { 
    name: string; 
    description?: string | null;
    isCollaborative?: boolean;
    isPublic?: boolean;
  }) {
    const [row] = await db
      .insert(playlists)
      .values({
        creatorId: userId,
        name: input.name,
        description: input.description ?? null,
        isCollaborative: input.isCollaborative ?? false,
        isPublic: input.isPublic ?? false,
      })
      .returning();
    return row;
  }
  async findById(playlistId: string) {
    const [row] = await db
      .select({
        id: playlists.id,
        name: playlists.name,
        description: playlists.description,
        isCollaborative: playlists.isCollaborative,
        isPublic: playlists.isPublic,
        coverArtUrl: playlists.coverArtUrl,
        trackCount: playlists.trackCount,
        totalDuration: playlists.totalDuration,
        createdAt: playlists.createdAt,
        updatedAt: playlists.updatedAt,
        creatorId: playlists.creatorId,
      })
      .from(playlists)
      .where(eq(playlists.id, playlistId))
      .limit(1);

    return row ?? null;
  }

  async updateById(
    playlistId: string,
    updates: {
      name?: string;
      description?: string | null;
      isCollaborative?: boolean;
      isPublic?: boolean;
      coverArtUrl?: string | null;
    }
  ) {
    const [updated] = await db
      .update(playlists)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, playlistId))
      .returning();

    return updated ?? null;
  }

  async deleteById(playlistId: string) {
    const [deleted] = await db
      .delete(playlists)
      .where(eq(playlists.id, playlistId))
      .returning();

    return deleted ?? null;
  }

  async getTracksForPlaylist(playlistId: string) {
    return db
      .select({
        id: playlistTracks.id,
        position: playlistTracks.position,
        addedAt: playlistTracks.addedAt,
        track: {
          id: tracks.id,
          title: tracks.title,
          artist: tracks.artist,
          album: tracks.album,
          duration: tracks.duration,
          coverArtUrl: tracks.coverArtUrl,
          fileUrl: tracks.fileUrl,
        },
      })
      .from(playlistTracks)
      .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(playlistTracks.position);
  }

  async addTrackToPlaylist(input: {
    playlistId: string;
    trackId: string;
    addedByUserId: string;
  }) {
    // Get current max position
    const [maxPos] = await db
      .select({ max: sql<number>`COALESCE(MAX(${playlistTracks.position}), -1)` })
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, input.playlistId));

    const nextPosition = (maxPos?.max ?? -1) + 1;

    const [added] = await db
      .insert(playlistTracks)
      .values({
        playlistId: input.playlistId,
        trackId: input.trackId,
        addedByUserId: input.addedByUserId,
        position: nextPosition,
      })
      .returning();

    // Update playlist track count and duration
    await this.recalculatePlaylistStats(input.playlistId);

    return added;
  }

  async removeTrackFromPlaylist(playlistId: string, playlistTrackId: string) {
    const [deleted] = await db
      .delete(playlistTracks)
      .where(
        and(
          eq(playlistTracks.id, playlistTrackId),
          eq(playlistTracks.playlistId, playlistId)
        )
      )
      .returning();

    if (deleted) {
      await this.recalculatePlaylistStats(playlistId);
    }

    return deleted ?? null;
  }

  private async recalculatePlaylistStats(playlistId: string) {
    const [stats] = await db
      .select({
        count: sql<number>`COUNT(*)`,
        totalDuration: sql<number>`COALESCE(SUM(${tracks.duration}), 0)`,
      })
      .from(playlistTracks)
      .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
      .where(eq(playlistTracks.playlistId, playlistId));

    await db
      .update(playlists)
      .set({
        trackCount: stats?.count ?? 0,
        totalDuration: stats?.totalDuration ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, playlistId));
  }
}

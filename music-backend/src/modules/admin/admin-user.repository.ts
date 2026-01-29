import { db } from "../../config/db";
import { users, playlists, listenHistory, tracks } from "../../database/schema";
import { eq, desc, sql, ilike, or } from "drizzle-orm";

export class AdminUserRepository {
  async listUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
    banned?: boolean;
  }) {
    let query = db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        isPremium: users.isPremium,
        isVerified: users.isVerified,
        isAdmin: users.isAdmin,
        isBanned: users.isBanned,
        lastActiveAt: users.lastActiveAt,
        createdAt: users.createdAt,
      })
      .from(users);

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      query = query.where(
        or(
          ilike(users.email, searchPattern),
          ilike(users.username, searchPattern)
        )
      ) as any;
    }

    if (params.banned !== undefined) {
      query = query.where(eq(users.isBanned, params.banned)) as any;
    }

    return query
      .orderBy(desc(users.createdAt))
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);
  }

  async getUserDetails(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    // Get stats
    const [stats] = await db
      .select({
        playlistCount: sql<number>`COUNT(DISTINCT ${playlists.id})`,
        listenCount: sql<number>`COUNT(DISTINCT ${listenHistory.id})`,
      })
      .from(users)
      .leftJoin(playlists, eq(playlists.creatorId, users.id))
      .leftJoin(listenHistory, eq(listenHistory.userId, users.id))
      .where(eq(users.id, userId));

    return {
      user,
      stats,
    };
  }

  async getUserListenHistory(userId: string, limit = 20) {
    return db
      .select({
        id: listenHistory.id,
        listenedAt: listenHistory.listenedAt,
        completionPercentage: listenHistory.completionPercentage,
        track: {
          id: tracks.id,
          title: tracks.title,
          artist: tracks.artist,
          duration: tracks.duration,
        },
      })
      .from(listenHistory)
      .innerJoin(tracks, eq(listenHistory.trackId, tracks.id))
      .where(eq(listenHistory.userId, userId))
      .orderBy(desc(listenHistory.listenedAt))
      .limit(limit);
  }

  async getUserPlaylists(userId: string, limit = 20) {
    return db
      .select()
      .from(playlists)
      .where(eq(playlists.creatorId, userId))
      .orderBy(desc(playlists.createdAt))
      .limit(limit);
  }

  async banUser(userId: string) {
    const [updated] = await db
      .update(users)
      .set({ isBanned: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async unbanUser(userId: string) {
    const [updated] = await db
      .update(users)
      .set({ isBanned: false, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async getDashboardStats() {
    const [userStats] = await db
      .select({
        totalUsers: sql<number>`COUNT(*)`,
        totalAdmins: sql<number>`COUNT(*) FILTER (WHERE ${users.isAdmin} = true)`,
        totalBanned: sql<number>`COUNT(*) FILTER (WHERE ${users.isBanned} = true)`,
        totalPremium: sql<number>`COUNT(*) FILTER (WHERE ${users.isPremium} = true)`,
      })
      .from(users);

    const [trackStats] = await db
      .select({
        totalTracks: sql<number>`COUNT(*)`,
        totalDuration: sql<number>`COALESCE(SUM(${tracks.duration}), 0)`,
      })
      .from(tracks);

    const [playlistStats] = await db
      .select({
        totalPlaylists: sql<number>`COUNT(*)`,
      })
      .from(playlists);

    const [listenStats] = await db
      .select({
        totalListens: sql<number>`COUNT(*)`,
      })
      .from(listenHistory);

    return {
      users: userStats,
      tracks: trackStats,
      playlists: playlistStats,
      listens: listenStats,
    };
  }
}

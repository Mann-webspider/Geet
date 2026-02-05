import { db } from "../../config/db";
import { artists, tracks, playbackEvents } from "../../database/schema";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

export class ArtistRepository {
  async create(input: {
    name: string;
    slug: string;
    bio?: string | null;
    imageUrl?: string | null;
    bgImageUrl?: string | null;
    spotifyUrl?: string | null;
    youtubeUrl?: string | null;
  }) {
    const [row] = await db
      .insert(artists)
      .values({
        name: input.name,
        slug: input.slug,
        bio: input.bio ?? null,
        imageUrl: input.imageUrl ?? null,
        bgImageUrl: input.bgImageUrl ?? null,
        spotifyUrl: input.spotifyUrl ?? null,
        youtubeUrl: input.youtubeUrl ?? null,
      })
      .returning();
    return row;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      bio: string | null;
      imageUrl: string | null;
      bgImageUrl: string | null;
      spotifyUrl: string | null;
      youtubeUrl: string | null;
      isVerified: boolean;
    }>,
  ) {
    const [row] = await db
      .update(artists)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(artists.id, id))
      .returning();

    return row ?? null;
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(artists)
      .where(eq(artists.id, id))
      .limit(1);
    return row ?? null;
  }

  async findBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(artists)
      .where(eq(artists.slug, slug))
      .limit(1);
    return row ?? null;
  }

  async list(params: { search?: string; limit?: number; offset?: number }) {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    let query = db.select().from(artists).orderBy(desc(artists.createdAt));

    if (params.search) {
      const pattern = `%${params.search}%`;
      query = db
        .select()
        .from(artists)
        .where(or(ilike(artists.name, pattern), ilike(artists.slug, pattern)))
        .orderBy(desc(artists.createdAt));
    }

    return query.limit(limit).offset(offset);
  }

  async getTracksForArtist(artistId: string, limit = 100, offset = 0) {
    return db
      .select()
      .from(tracks)
      .where(eq(tracks.artistId, artistId))
      .orderBy(desc(tracks.playCount))
      .limit(limit)
      .offset(offset);
  }

  // Basic top artists by total track playCount (later you can use playbackEvents)
  async getTopArtists(limit = 20) {
    const rows = await db
      .select({
        artistId: artists.id,
        name: artists.name,
        slug: artists.slug,
        imageUrl: artists.imageUrl,
        totalPlays: sql<number>`COALESCE(SUM(${tracks.playCount}), 0)`,
      })
      .from(artists)
      .leftJoin(tracks, eq(artists.id, tracks.artistId))
      .groupBy(artists.id)
      .orderBy(desc(sql`COALESCE(SUM(${tracks.playCount}), 0)`))
      .limit(limit);

    return rows;
  }
}

import { db } from "../../config/db";
import { ingestionJobs, tracks, users } from "../../database/schema";
import { eq, desc, sql } from "drizzle-orm";

export class IngestionJobRepository {
  async createJob(input: {
    sourceType: "youtube" | "torrent" | "manual";
    sourceInput: string;
    requestedByAdminId: string;
  }) {
    const [job] = await db
      .insert(ingestionJobs)
      .values({
        sourceType: input.sourceType,
        sourceInput: input.sourceInput,
        requestedByAdminId: input.requestedByAdminId,
        status: "pending",
      })
      .returning();

    return job;
  }

  async updateJobStatus(
    jobId: string,
    updates: Partial<{
      status: string;
      extractedTitle: string | null;
      extractedArtist: string | null;
      extractedDuration: number | null;
      extractedThumbnail: string | null;
      trackId: string | null;
      errorCode: string | null;
      errorMessage: string | null;
      debugLog: string | null;
      completedAt: Date | null;
    }>
  ) {
    const [updated] = await db
      .update(ingestionJobs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(ingestionJobs.id, jobId))
      .returning();

    return updated ?? null;
  }

  async incrementRetryCount(jobId: string) {
    await db
      .update(ingestionJobs)
      .set({
        retryCount: sql`${ingestionJobs.retryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(ingestionJobs.id, jobId));
  }

  async findPendingJobs(limit = 10) {
    return db
      .select()
      .from(ingestionJobs)
      .where(eq(ingestionJobs.status, "pending"))
      .orderBy(ingestionJobs.createdAt)
      .limit(limit);
  }

  async listJobs(params: { limit?: number; offset?: number; status?: string }) {
    let query = db
      .select({
        job: ingestionJobs,
        admin: {
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
      .from(ingestionJobs)
      .leftJoin(users, eq(ingestionJobs.requestedByAdminId, users.id))
      .leftJoin(tracks, eq(ingestionJobs.trackId, tracks.id));

    if (params.status) {
      query = query.where(eq(ingestionJobs.status, params.status)) as any;
    }

    return query
      .orderBy(desc(ingestionJobs.createdAt))
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);
  }

  async getJobById(jobId: string) {
    const [result] = await db
      .select({
        job: ingestionJobs,
        track: tracks,
      })
      .from(ingestionJobs)
      .leftJoin(tracks, eq(ingestionJobs.trackId, tracks.id))
      .where(eq(ingestionJobs.id, jobId))
      .limit(1);

    return result ?? null;
  }

  async deleteJob(jobId: string) {
    const [deleted] = await db
      .delete(ingestionJobs)
      .where(eq(ingestionJobs.id, jobId))
      .returning();

    return deleted;
  }
}

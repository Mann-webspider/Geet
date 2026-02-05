import { db } from "../../config/db";
import { notifications } from "../../database/schema";
import { and, desc, eq } from "drizzle-orm";

export class NotificationRepository {
  async create(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    const [row] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data ?? {},
        isRead: false,
      })
      .returning();

    return row;
  }

  async listForUser(params: {
    userId: string;
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }) {
    let q = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, params.userId));

    if (params.unreadOnly) {
      q = q.where(
        and(
          eq(notifications.userId, params.userId),
          eq(notifications.isRead, false),
        ),
      ) as any;
    }

    return q
      .orderBy(desc(notifications.createdAt))
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);
  }

  async markRead(input: { userId: string; notificationId: string }) {
    const [row] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, input.userId),
        ),
      )
      .returning();

    return row ?? null;
  }
}

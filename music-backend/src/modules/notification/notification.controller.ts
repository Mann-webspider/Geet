import { type Response } from "express";
import { type AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";
import { NotificationRepository } from "./notification.repository";

const repo = new NotificationRepository();

export const NotificationController = {
  async listMine(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ status: "error", error: "Unauthorized" });

    try {
      const { limit, offset, unreadOnly } = req.query;

      const rows = await repo.listForUser({
        userId,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        unreadOnly: unreadOnly === "true",
      });

      logger.info(
        {
          event: "notifications_list_success",
          userId,
          count: rows.length,
          durationMs: Date.now() - startedAt,
        },
        "Listed notifications",
      );

      return res.json({ status: "success", data: rows });
    } catch (err: any) {
      logger.error(
        {
          event: "notifications_list_error",
          userId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to list notifications",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },

  async markRead(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ status: "error", error: "Unauthorized" });

    try {
      const id = req.params.id;
      const row = await repo.markRead({ userId, notificationId: id });

      if (!row)
        return res
          .status(404)
          .json({ status: "error", error: "Notification not found" });

      logger.info(
        {
          event: "notification_mark_read_success",
          userId,
          notificationId: id,
          durationMs: Date.now() - startedAt,
        },
        "Notification marked read",
      );

      return res.json({ status: "success", data: row });
    } catch (err: any) {
      logger.error(
        {
          event: "notification_mark_read_error",
          userId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to mark notification read",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },
};

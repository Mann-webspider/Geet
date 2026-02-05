import { type Response } from "express";
import { type AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";
import {
  AdminMusicRequestRepository,
  type AdminMusicRequestStatus,
} from "./admin-music-request.repository";
import { NotificationRepository } from "../notification/notification.repository";

const repo = new AdminMusicRequestRepository();
const notifRepo = new NotificationRepository();

const allowed: AdminMusicRequestStatus[] = [
  "submitted",
  "in_review",
  "in_progress",
  "completed",
  "rejected",
];

function isStatus(v: any): v is AdminMusicRequestStatus {
  return allowed.includes(v);
}

export const AdminMusicRequestController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const { limit, offset, status } = req.query;

    try {
      const rows = await repo.list({
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      logger.info(
        {
          event: "admin_music_requests_list_success",
          count: rows.length,
          durationMs: Date.now() - startedAt,
        },
        "Admin listed music requests",
      );

      return res.json({ status: "success", data: rows });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_music_requests_list_error",
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to list music requests",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const id = req.params.id;

    try {
      const row = await repo.getById(id);
      if (!row)
        return res
          .status(404)
          .json({ status: "error", error: "Request not found" });

      logger.info(
        {
          event: "admin_music_request_get_success",
          requestId: id,
          durationMs: Date.now() - startedAt,
        },
        "Admin fetched music request",
      );

      return res.json({ status: "success", data: row });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_music_request_get_error",
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch music request",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const id = req.params.id;

    try {
      const existing = await repo.getById(id);
      if (!existing)
        return res
          .status(404)
          .json({ status: "error", error: "Request not found" });

      const { status, adminNote, resolvedTrackId } = req.body ?? {};

      if (status && !isStatus(status)) {
        return res.status(400).json({
          status: "error",
          error: `status must be one of: ${allowed.join(", ")}`,
        });
      }

      // Business rule:
      // - If completed => resolvedTrackId is recommended (so user can listen)
      // - If rejected => resolvedTrackId must be null
      if (
        status === "completed" &&
        !resolvedTrackId &&
        !existing.request.resolvedTrackId
      ) {
        return res.status(400).json({
          status: "error",
          error: "resolvedTrackId is required when marking completed",
        });
      }

      if (status === "rejected" && resolvedTrackId) {
        return res.status(400).json({
          status: "error",
          error: "resolvedTrackId must not be set when rejected",
        });
      }

      const resolvedAt =
        status === "completed" || status === "rejected"
          ? new Date()
          : (existing.request.resolvedAt ?? null);

      const updated = await repo.update(id, {
        status: status ?? existing.request.status,
        adminNote:
          typeof adminNote === "string"
            ? adminNote
            : adminNote === null
              ? null
              : (existing.request.adminNote ?? null),
        resolvedTrackId:
          resolvedTrackId ?? existing.request.resolvedTrackId ?? null,
        resolvedAt,
      });

      if (!updated)
        return res
          .status(500)
          .json({ status: "error", error: "Update failed" });

      // Create in-app notification when status changes
      const statusChanged = status && status !== existing.request.status;
      if (statusChanged) {
        const title =
          status === "completed"
            ? "Request completed"
            : status === "rejected"
              ? "Request rejected"
              : "Request updated";

        const message =
          status === "completed"
            ? "Your requested song is now available. You can listen to it."
            : status === "rejected"
              ? "We couldn't fulfill your song request."
              : `Your request status is now: ${status}.`;

        await notifRepo.create({
          userId: existing.request.userId,
          type: "music_request_status",
          title,
          message,
          data: {
            requestId: existing.request.id,
            status,
            trackId: updated.resolvedTrackId ?? null,
          },
        });
      }

      logger.info(
        {
          event: "admin_music_request_update_success",
          requestId: id,
          durationMs: Date.now() - startedAt,
        },
        "Admin updated music request",
      );

      return res.json({ status: "success", data: updated });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_music_request_update_error",
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to update music request",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },
};

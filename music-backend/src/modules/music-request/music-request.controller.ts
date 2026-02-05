import { type Response } from "express";
import { type AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";
import { MusicRequestRepository } from "./music-request.repository";

const repo = new MusicRequestRepository();

function isPriority(v: any): v is "low" | "normal" | "high" {
  return v === "low" || v === "normal" || v === "high";
}

export const MusicRequestController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ status: "error", error: "Unauthorized" });

    try {
      const { songTitle, artistName, albumName, notes, priority } =
        req.body ?? {};

      if (!songTitle || !artistName) {
        return res.status(400).json({
          status: "error",
          error: "songTitle and artistName are required",
        });
      }

      if (priority && !isPriority(priority)) {
        return res.status(400).json({
          status: "error",
          error: "priority must be low, normal, or high",
        });
      }

      const created = await repo.create({
        userId,
        songTitle,
        artistName,
        albumName: albumName ?? null,
        notes: notes ?? null,
        priority: priority ?? "normal",
      });

      logger.info(
        {
          event: "music_request_create_success",
          userId,
          requestId: created.id,
          durationMs: Date.now() - startedAt,
        },
        "Music request created",
      );

      return res.status(201).json({ status: "success", data: created });
    } catch (err: any) {
      logger.error(
        {
          event: "music_request_create_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to create music request",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },

  async listMine(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ status: "error", error: "Unauthorized" });

    try {
      const { status, limit, offset } = req.query;

      const rows = await repo.listForUser({
        userId,
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      logger.info(
        {
          event: "music_requests_list_mine_success",
          userId,
          count: rows.length,
          durationMs: Date.now() - startedAt,
        },
        "Listed user music requests",
      );

      return res.json({ status: "success", data: rows });
    } catch (err: any) {
      logger.error(
        {
          event: "music_requests_list_mine_error",
          userId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to list user music requests",
      );
      return res
        .status(500)
        .json({ status: "error", error: "Internal server error" });
    }
  },

  async getMineById(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ status: "error", error: "Unauthorized" });

    try {
      const id = req.params.id;
      const row = await repo.getByIdForUser({ id, userId });

      if (!row)
        return res
          .status(404)
          .json({ status: "error", error: "Request not found" });

      logger.info(
        {
          event: "music_request_get_mine_success",
          userId,
          requestId: id,
          durationMs: Date.now() - startedAt,
        },
        "Fetched music request",
      );

      return res.json({ status: "success", data: row });
    } catch (err: any) {
      logger.error(
        {
          event: "music_request_get_mine_error",
          userId,
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
};

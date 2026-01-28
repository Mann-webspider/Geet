import { Request, Response } from "express";
import { TrackRepository } from "./track.repository";
import { AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";

const repo = new TrackRepository();

export const TrackController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;

    try {
      const tracks = await repo.findAll();

      logger.info(
        {
          event: "tracks_list_success",
          userId,
          count: tracks.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched tracks"
      );

      return res.json({ status: "success", data: tracks });
    } catch (err: any) {
      logger.error(
        {
          event: "tracks_list_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch tracks"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async search(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const query = req.query.q as string;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        status: "error",
        error: "Search query is required",
      });
    }

    try {
      const tracks = await repo.search(query.trim());

      logger.info(
        {
          event: "tracks_search_success",
          userId,
          query,
          count: tracks.length,
          durationMs: Date.now() - startedAt,
        },
        "Search completed"
      );

      return res.json({ status: "success", data: tracks });
    } catch (err: any) {
      logger.error(
        {
          event: "tracks_search_error",
          userId,
          query,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Search failed"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

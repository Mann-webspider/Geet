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

  async edit(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const trackId = req.params.id;

    try {
      const existing = await repo.getById(trackId);
      if (!existing) {
        return res.status(404).json({
          status: "error",
          error: "Track not found",
        });
      }

      const body = req.body ?? {};
      const update: any = {};

      if (typeof body.title === "string") update.title = body.title;
      if (typeof body.artist === "string") update.artist = body.artist;
      if (typeof body.album !== "undefined") update.album = body.album;
      if (typeof body.genre !== "undefined") update.genre = body.genre;

      if (typeof body.duration !== "undefined") {
        const durationNum =
          typeof body.duration === "number"
            ? body.duration
            : Number(body.duration);
        if (!Number.isNaN(durationNum)) {
          update.duration = durationNum;
        }
      }

      if (typeof body.isExplicit !== "undefined") {
        if (typeof body.isExplicit === "boolean") {
          update.isExplicit = body.isExplicit;
        } else if (body.isExplicit === "true") {
          update.isExplicit = true;
        } else if (body.isExplicit === "false") {
          update.isExplicit = false;
        }
      }

      if (typeof body.coverArtUrl !== "undefined") {
        update.coverArtUrl = body.coverArtUrl;
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          status: "error",
          error: "No valid fields to update",
        });
      }

      const updated = await repo.updateTrack(trackId, update);

      logger.info(
        {
          event: "track_edit_success",
          userId,
          trackId,
          durationMs: Date.now() - startedAt,
        },
        "Track updated"
      );

      return res.json({ status: "success", data: updated });
    } catch (err: any) {
      logger.error(
        {
          event: "track_edit_error",
          userId,
          trackId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to edit track"
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const trackId = req.params.id;
    logger.info({ event: "track_get_by_id", trackId }, "Fetching track by ID");
    const track = await repo.getById(trackId);
    if (!track) {
      return res.status(404).json({
        status: "error",
        error: "Track not found",
      });
    }
    return res.json({ status: "success", data: track });
  },
};

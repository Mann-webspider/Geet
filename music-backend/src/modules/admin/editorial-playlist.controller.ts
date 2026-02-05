import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";
import { EditorialPlaylistRepository } from "./editorial-playlist.repository";

const repo = new EditorialPlaylistRepository();

export const EditorialPlaylistController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const adminId = req.user?.id;

    try {
      const { name, description, coverArtUrl, priority, visibleOnHome } = req.body ?? {};

      if (!name || typeof name !== "string") {
        return res.status(400).json({
          status: "error",
          error: "Name is required",
        });
      }

      const playlist = await repo.createEditorialPlaylist({
        name,
        description,
        coverArtUrl,
        priority: typeof priority === "number" ? priority : Number(priority) || 0,
        visibleOnHome:
          typeof visibleOnHome === "boolean"
            ? visibleOnHome
            : visibleOnHome === "true",
        editorialType: "home_curated",
        createdByAdminId: adminId!,
      });

      logger.info(
        {
          event: "editorial_playlist_create_success",
          adminId,
          playlistId: playlist.id,
          durationMs: Date.now() - startedAt,
        },
        "Created editorial playlist"
      );

      return res.json({ status: "success", data: playlist });
    } catch (err: any) {
      logger.error(
        {
          event: "editorial_playlist_create_error",
          adminId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to create editorial playlist"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const adminId = req.user?.id;
    const playlistId = req.params.id;

    try {
      const { name, description, coverArtUrl, priority, visibleOnHome } = req.body ?? {};

      const update: any = {};
      if (typeof name === "string") update.name = name;
      if (typeof description !== "undefined") update.description = description;
      if (typeof coverArtUrl !== "undefined") update.coverArtUrl = coverArtUrl;
      if (typeof priority !== "undefined") {
        const p = typeof priority === "number" ? priority : Number(priority);
        if (!Number.isNaN(p)) update.priority = p;
      }
      if (typeof visibleOnHome !== "undefined") {
        if (typeof visibleOnHome === "boolean") {
          update.visibleOnHome = visibleOnHome;
        } else if (visibleOnHome === "true") {
          update.visibleOnHome = true;
        } else if (visibleOnHome === "false") {
          update.visibleOnHome = false;
        }
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          status: "error",
          error: "No valid fields to update",
        });
      }

      const updated = await repo.updateEditorialPlaylist(playlistId, update);
      if (!updated) {
        return res.status(404).json({
          status: "error",
          error: "Editorial playlist not found",
        });
      }

      logger.info(
        {
          event: "editorial_playlist_update_success",
          adminId,
          playlistId,
          durationMs: Date.now() - startedAt,
        },
        "Updated editorial playlist"
      );

      return res.json({ status: "success", data: updated });
    } catch (err: any) {
      logger.error(
        {
          event: "editorial_playlist_update_error",
          adminId,
          playlistId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to update editorial playlist"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async setTracks(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const adminId = req.user?.id;
    const playlistId = req.params.id;

    try {
      const { trackIds } = req.body ?? {};
      if (!Array.isArray(trackIds) || trackIds.length === 0) {
        return res.status(400).json({
          status: "error",
          error: "trackIds array is required",
        });
      }

      await repo.setPlaylistTracks(playlistId, trackIds);

      logger.info(
        {
          event: "editorial_playlist_set_tracks_success",
          adminId,
          playlistId,
          trackCount: trackIds.length,
          durationMs: Date.now() - startedAt,
        },
        "Set editorial playlist tracks"
      );

      return res.json({ status: "success" });
    } catch (err: any) {
      logger.error(
        {
          event: "editorial_playlist_set_tracks_error",
          adminId,
          playlistId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to set editorial playlist tracks"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async refreshTrending(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const adminId = req.user?.id;

    try {
      const windowHours =
        req.body?.windowHours != null
          ? Number(req.body.windowHours)
          : 24;
      const limit =
        req.body?.limit != null
          ? Number(req.body.limit)
          : 50;

      const trendingTrackIds = await repo.computeTrendingTracks({
        windowHours: windowHours > 0 ? windowHours : 24,
        limit: limit > 0 ? limit : 50,
      });

      const playlist = await repo.getOrCreateTrendingPlaylist(adminId!);
      await repo.setPlaylistTracks(playlist.id, trendingTrackIds);

      logger.info(
        {
          event: "trending_playlist_refresh_success",
          adminId,
          playlistId: playlist.id,
          trackCount: trendingTrackIds.length,
          windowHours,
          durationMs: Date.now() - startedAt,
        },
        "Refreshed trending playlist"
      );

      return res.json({
        status: "success",
        data: {
          playlistId: playlist.id,
          trackCount: trendingTrackIds.length,
        },
      });
    } catch (err: any) {
      logger.error(
        {
          event: "trending_playlist_refresh_error",
          adminId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to refresh trending playlist"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

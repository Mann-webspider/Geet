import { Response } from "express";
import { PlaylistRepository } from "./playlist.repository";
import { AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";

const repo = new PlaylistRepository();

export const PlaylistTracksController = {
  async addTrack(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const playlistId = req.params.id;
    const { trackId } = req.body;

    if (!userId) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    if (!trackId) {
      return res.status(400).json({
        status: "error",
        error: "trackId is required",
      });
    }

    try {
      logger.info(
        {
          event: "playlist_add_track_request",
          userId,
          playlistId,
          trackId,
        },
        "Add track to playlist request"
      );

      // Check ownership or collaboration
      const playlist = await repo.findById(playlistId);

      if (!playlist) {
        return res.status(404).json({
          status: "error",
          error: "Playlist not found",
        });
      }

      const isOwner = playlist.creatorId === userId;
      const canEdit = isOwner || playlist.isCollaborative;

      if (!canEdit) {
        logger.warn(
          {
            event: "playlist_add_track_forbidden",
            userId,
            playlistId,
          },
          "User not authorized to edit playlist"
        );
        return res.status(403).json({
          status: "error",
          error: "You do not have permission to edit this playlist",
        });
      }

      const added = await repo.addTrackToPlaylist({
        playlistId,
        trackId,
        addedByUserId: userId,
      });

      logger.info(
        {
          event: "playlist_add_track_success",
          userId,
          playlistId,
          trackId,
          position: added.position,
          durationMs: Date.now() - startedAt,
        },
        "Track added to playlist"
      );

      return res.status(201).json({
        status: "success",
        data: added,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "playlist_add_track_error",
          userId,
          playlistId,
          trackId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to add track"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async removeTrack(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const playlistId = req.params.id;
    const playlistTrackId = req.params.trackId;

    if (!userId) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      logger.info(
        {
          event: "playlist_remove_track_request",
          userId,
          playlistId,
          playlistTrackId,
        },
        "Remove track from playlist request"
      );

      const playlist = await repo.findById(playlistId);

      if (!playlist) {
        return res.status(404).json({
          status: "error",
          error: "Playlist not found",
        });
      }

      const isOwner = playlist.creatorId === userId;
      const canEdit = isOwner || playlist.isCollaborative;

      if (!canEdit) {
        return res.status(403).json({
          status: "error",
          error: "You do not have permission to edit this playlist",
        });
      }

      const removed = await repo.removeTrackFromPlaylist(
        playlistId,
        playlistTrackId
      );

      if (!removed) {
        return res.status(404).json({
          status: "error",
          error: "Track not found in playlist",
        });
      }

      logger.info(
        {
          event: "playlist_remove_track_success",
          userId,
          playlistId,
          playlistTrackId,
          durationMs: Date.now() - startedAt,
        },
        "Track removed from playlist"
      );

      return res.json({
        status: "success",
        message: "Track removed from playlist",
      });
    } catch (err: any) {
      logger.error(
        {
          event: "playlist_remove_track_error",
          userId,
          playlistId,
          playlistTrackId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to remove track"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

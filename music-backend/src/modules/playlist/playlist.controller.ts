import { type Response } from "express";
import { PlaylistRepository } from "./playlist.repository";
import { type AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";

const repo = new PlaylistRepository();

export const PlaylistController = {
  async listMine(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;

    if (!userId) {
      logger.warn({ event: "playlists_mine_no_user" }, "User missing");
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      const items = await repo.findByOwner(userId);

      logger.info(
        {
          event: "playlists_mine_success",
          userId,
          count: items.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched user playlists"
      );

      return res.json({ status: "success", data: items });
    } catch (err: any) {
      logger.error(
        {
          event: "playlists_mine_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch playlists"
      );
      return res.status(500).json({ status: "error", error: "Internal server error" });
    }
  },
  async getById(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const playlistId = req.params.id;

    if (!userId) {
      logger.warn(
        { event: "playlist_get_no_user", playlistId },
        "User missing"
      );
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      logger.info(
        {
          event: "playlist_get_request",
          userId,
          playlistId,
        },
        "Fetching playlist by ID"
      );

      if (typeof playlistId !== "string") {
        return res.status(400).json({ status: "error", error: "Invalid playlist ID" });
      }

      const playlist = await repo.findById(playlistId);

      if (!playlist) {
        logger.warn(
          {
            event: "playlist_get_not_found",
            userId,
            playlistId,
            durationMs: Date.now() - startedAt,
          },
          "Playlist not found"
        );
        return res.status(404).json({
          status: "error",
          error: "Playlist not found",
        });
      }

      // Authorization: owner or public
      const isOwner = playlist.creatorId === userId;
      const isPublic = playlist.isPublic;

      if (!isOwner && !isPublic) {
        logger.warn(
          {
            event: "playlist_get_forbidden",
            userId,
            playlistId,
            creatorId: playlist.creatorId,
            isPublic: playlist.isPublic,
            durationMs: Date.now() - startedAt,
          },
          "User not authorized to view this playlist"
        );
        return res.status(403).json({
          status: "error",
          error: "You do not have permission to view this playlist",
        });
      }

      logger.info(
        {
          event: "playlist_get_success",
          userId,
          playlistId,
          isOwner,
          isPublic,
          durationMs: Date.now() - startedAt,
        },
        "Playlist fetched successfully"
      );

      const playlistTracks = await repo.getTracksForPlaylist(playlistId);

    logger.info(
      {
        event: "playlist_get_success",
        userId,
        playlistId,
        isOwner,
        isPublic,
        trackCount: playlistTracks.length,
        durationMs: Date.now() - startedAt,
      },
      "Playlist fetched successfully"
    );


      // Return response
      return res.json({
      status: "success",
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isCollaborative: playlist.isCollaborative,
        isPublic: playlist.isPublic,
        coverArtUrl: playlist.coverArtUrl,
        trackCount: playlist.trackCount,
        totalDuration: playlist.totalDuration,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        owner: {
          id: playlist.creatorId,
        },
        tracks: playlistTracks,
      },
    });
    } catch (err: any) {
      logger.error(
        {
          event: "playlist_get_error",
          userId,
          playlistId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch playlist"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
  async create(req: AuthenticatedRequest, res: Response) {
  const startedAt = Date.now();
  const userId = req.user?.id;
  const body = req.body;

  if (!userId) {
    logger.warn({ event: "playlist_create_no_user" }, "User missing");
    return res.status(401).json({ status: "error", error: "Unauthorized" });
  }

  try {
    logger.info(
      {
        event: "playlist_create_request",
        userId,
        name: body.name,
      },
      "Create playlist request"
    );

    // Validation
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      logger.warn(
        { event: "playlist_create_invalid_name", userId },
        "Invalid playlist name"
      );
      return res.status(400).json({
        status: "error",
        error: "Playlist name is required",
      });
    }

    if (body.name.length > 255) {
      return res.status(400).json({
        status: "error",
        error: "Playlist name too long (max 255 characters)",
      });
    }

    const playlist = await repo.createForUser(userId, {
      name: body.name.trim(),
      description: body.description || null,
      isCollaborative: body.isCollaborative ?? false,
      isPublic: body.isPublic ?? false,
    });

    logger.info(
      {
        event: "playlist_create_success",
        userId,
        playlistId: playlist.id,
        name: playlist.name,
        durationMs: Date.now() - startedAt,
      },
      "Playlist created"
    );

    return res.status(201).json({
      status: "success",
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isCollaborative: playlist.isCollaborative,
        isPublic: playlist.isPublic,
        coverArtUrl: playlist.coverArtUrl,
        trackCount: playlist.trackCount,
        totalDuration: playlist.totalDuration,
        createdAt: playlist.createdAt,
        owner: {
          id: playlist.creatorId,
        },
      },
    });
  } catch (err: any) {
    logger.error(
      {
        event: "playlist_create_error",
        userId,
        error: err?.message,
        stack: err?.stack,
        durationMs: Date.now() - startedAt,
      },
      "Failed to create playlist"
    );
    return res.status(500).json({
      status: "error",
      error: "Internal server error",
    });
  }
},

   async update(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const playlistId = req.params.id;
    const body = req.body;

    if (!userId) {
      logger.warn(
        { event: "playlist_update_no_user", playlistId },
        "User missing"
      );
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      logger.info(
        {
          event: "playlist_update_request",
          userId,
          playlistId,
        },
        "Update playlist request"
      );

      // Check ownership
      const existing = await repo.findById(playlistId);

      if (!existing) {
        logger.warn(
          {
            event: "playlist_update_not_found",
            userId,
            playlistId,
            durationMs: Date.now() - startedAt,
          },
          "Playlist not found"
        );
        return res.status(404).json({
          status: "error",
          error: "Playlist not found",
        });
      }

      if (existing.creatorId !== userId) {
        logger.warn(
          {
            event: "playlist_update_forbidden",
            userId,
            playlistId,
            ownerId: existing.creatorId,
            durationMs: Date.now() - startedAt,
          },
          "User not authorized to update this playlist"
        );
        return res.status(403).json({
          status: "error",
          error: "You do not have permission to update this playlist",
        });
      }

      // Validation
      const updates: any = {};

      if (body.name !== undefined) {
        if (typeof body.name !== "string" || body.name.trim() === "") {
          return res.status(400).json({
            status: "error",
            error: "Playlist name cannot be empty",
          });
        }
        if (body.name.length > 255) {
          return res.status(400).json({
            status: "error",
            error: "Playlist name too long (max 255 characters)",
          });
        }
        updates.name = body.name.trim();
      }

      if (body.description !== undefined) {
        updates.description = body.description || null;
      }

      if (body.isCollaborative !== undefined) {
        updates.isCollaborative = Boolean(body.isCollaborative);
      }

      if (body.isPublic !== undefined) {
        updates.isPublic = Boolean(body.isPublic);
      }

      if (body.coverArtUrl !== undefined) {
        updates.coverArtUrl = body.coverArtUrl || null;
      }

      const updated = await repo.updateById(playlistId, updates);

      logger.info(
        {
          event: "playlist_update_success",
          userId,
          playlistId,
          updates: Object.keys(updates),
          durationMs: Date.now() - startedAt,
        },
        "Playlist updated"
      );

      return res.json({
        status: "success",
        data: {
          id: updated!.id,
          name: updated!.name,
          description: updated!.description,
          isCollaborative: updated!.isCollaborative,
          isPublic: updated!.isPublic,
          coverArtUrl: updated!.coverArtUrl,
          trackCount: updated!.trackCount,
          totalDuration: updated!.totalDuration,
          createdAt: updated!.createdAt,
          updatedAt: updated!.updatedAt,
          owner: {
            id: updated!.creatorId,
          },
        },
      });
    } catch (err: any) {
      logger.error(
        {
          event: "playlist_update_error",
          userId,
          playlistId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to update playlist"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const playlistId = req.params.id;

    if (!userId) {
      logger.warn(
        { event: "playlist_delete_no_user", playlistId },
        "User missing"
      );
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      logger.info(
        {
          event: "playlist_delete_request",
          userId,
          playlistId,
        },
        "Delete playlist request"
      );

      // Check ownership
      const existing = await repo.findById(playlistId);

      if (!existing) {
        logger.warn(
          {
            event: "playlist_delete_not_found",
            userId,
            playlistId,
            durationMs: Date.now() - startedAt,
          },
          "Playlist not found"
        );
        return res.status(404).json({
          status: "error",
          error: "Playlist not found",
        });
      }

      if (existing.creatorId !== userId) {
        logger.warn(
          {
            event: "playlist_delete_forbidden",
            userId,
            playlistId,
            ownerId: existing.creatorId,
            durationMs: Date.now() - startedAt,
          },
          "User not authorized to delete this playlist"
        );
        return res.status(403).json({
          status: "error",
          error: "You do not have permission to delete this playlist",
        });
      }

      await repo.deleteById(playlistId);

      logger.info(
        {
          event: "playlist_delete_success",
          userId,
          playlistId,
          durationMs: Date.now() - startedAt,
        },
        "Playlist deleted"
      );

      return res.json({
        status: "success",
        message: "Playlist deleted successfully",
      });
    } catch (err: any) {
      logger.error(
        {
          event: "playlist_delete_error",
          userId,
          playlistId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to delete playlist"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

};

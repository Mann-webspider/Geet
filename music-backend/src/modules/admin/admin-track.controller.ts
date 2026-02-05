import { type Response } from "express";
import { type AuthenticatedRequest } from "../../middleware/auth";
import { AdminTrackRepository } from "./admin-track.repository";
import { getStorageClient } from "../../services/storage";
import { logger } from "../../config/logger";
import multer from "multer";
import { db } from "../../config/db";
import { artists, tracks } from "../../database/schema";
import { eq } from "drizzle-orm";

const repo = new AdminTrackRepository();
const upload = multer({ storage: multer.memoryStorage() });

export const AdminTrackController = {
  uploadMiddleware: upload.single("file"),

  async uploadTrack(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const file = req.file;
    const body = req.body;

    if (!file) {
      return res.status(400).json({
        status: "error",
        error: "Audio file is required",
      });
    }

    try {
      logger.info(
        {
          event: "admin_track_upload_request",
          userId,
          filename: file.originalname,
          size: file.size,
        },
        "Admin uploading track",
      );

      const storage = getStorageClient();
      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = `audio/${filename}`;

      const fileUrl = await storage.saveFile({
        path: filePath,
        buffer: file.buffer,
        contentType: file.mimetype,
      });

      const track = await repo.createTrack({
        title: body.title || file.originalname,
        artist: body.artist || "Unknown Artist",
        album: body.album,
        duration: parseInt(body.duration) || 0,
        fileUrl,
        coverArtUrl: body.coverArtUrl,
        genre: body.genre,
        releaseYear: body.releaseYear ? parseInt(body.releaseYear) : undefined,
        isExplicit: body.isExplicit === "true",
      });

      logger.info(
        {
          event: "admin_track_upload_success",
          userId,
          trackId: track.id,
          durationMs: Date.now() - startedAt,
        },
        "Track uploaded successfully",
      );

      return res.status(201).json({
        status: "success",
        data: track,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_track_upload_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to upload track",
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async listTracks(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const { limit, offset, search } = req.query;

    try {
      const tracks = await repo.listTracks({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        search: search as string,
      });

      logger.info(
        {
          event: "admin_tracks_list_success",
          count: tracks.length,
          durationMs: Date.now() - startedAt,
        },
        "Admin fetched tracks",
      );

      return res.json({
        status: "success",
        data: tracks,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_tracks_list_error",
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to list tracks",
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async deleteTrack(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const trackId = req.params.id;
    const userId = req.user?.id;

    try {
      const track = await repo.getTrackById(trackId);

      if (!track) {
        return res.status(404).json({
          status: "error",
          error: "Track not found",
        });
      }

      await repo.deleteTrack(trackId);

      // TODO: Delete file from storage as well

      logger.info(
        {
          event: "admin_track_delete_success",
          userId,
          trackId,
          durationMs: Date.now() - startedAt,
        },
        "Track deleted",
      );

      return res.json({
        status: "success",
        message: "Track deleted successfully",
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_track_delete_error",
          userId,
          trackId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to delete track",
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
  // PATCH /v1/admin/tracks/:id/artist
  // body: { artistId: string | null }

  async setArtist(req: AuthenticatedRequest, res: Response) {
    const trackId = req.params.id;
    const { artistId } = req.body as { artistId: string | null };

    // If artistId is null → deassign
    if (artistId === null) {
      const [updated] = await db
        .update(tracks)
        .set({
          artistId: null,
          // optional: keep the old artist text, or clear it:
          // artist: null,
          updatedAt: new Date(),
        })
        .where(eq(tracks.id, trackId))
        .returning();

      if (!updated) {
        return res
          .status(404)
          .json({ status: "error", error: "Track not found" });
      }

      return res.json({ status: "success", data: updated });
    }

    // Normal assign flow
    if (!artistId) {
      return res
        .status(400)
        .json({
          status: "error",
          error: "artistId is required (or null to deassign)",
        });
    }

    const [artist] = await db
      .select()
      .from(artists)
      .where(eq(artists.id, artistId))
      .limit(1);

    if (!artist) {
      return res
        .status(404)
        .json({ status: "error", error: "Artist not found" });
    }

    const [updated] = await db
      .update(tracks)
      .set({
        artistId,
        artist: artist.name,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, trackId))
      .returning();

    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", error: "Track not found" });
    }

    return res.json({ status: "success", data: updated });
  },
};

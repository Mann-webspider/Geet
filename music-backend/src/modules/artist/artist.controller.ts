import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";
import { ArtistRepository } from "./artist.repository";

const repo = new ArtistRepository();

export const ArtistController = {
  // USER: list artists
  async list(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const search = (req.query.search as string) || undefined;
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);

    try {
      const artists = await repo.list({ search, limit, offset });

      logger.info(
        {
          event: "artists_list_success",
          userId,
          search,
          count: artists.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched artists",
      );

      return res.json({ status: "success", data: artists });
    } catch (err: any) {
      logger.error(
        {
          event: "artists_list_error",
          userId,
          search,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch artists",
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  // USER: get specific artist + track summary
  async get(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const idOrSlug = req.params.id;

    try {
      const byId = await repo.findById(idOrSlug);
      const artist = byId ?? (await repo.findBySlug(idOrSlug));

      if (!artist) {
        return res.status(404).json({
          status: "error",
          error: "Artist not found",
        });
      }

      const tracks = await repo.getTracksForArtist(artist.id, 100, 0);

      logger.info(
        {
          event: "artist_get_success",
          userId,
          artistId: artist.id,
          trackCount: tracks.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched artist and tracks",
      );

      return res.json({
        status: "success",
        data: {
          artist,
          tracks,
        },
      });
    } catch (err: any) {
      logger.error(
        {
          event: "artist_get_error",
          userId,
          idOrSlug,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch artist",
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  // USER: top artists
  async top(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const limit = Number(req.query.limit ?? 20);

    try {
      const rows = await repo.getTopArtists(limit);

      logger.info(
        {
          event: "artists_top_success",
          userId,
          count: rows.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched top artists",
      );

      return res.json({ status: "success", data: rows });
    } catch (err: any) {
      logger.error(
        {
          event: "artists_top_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch top artists",
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  // ADMIN: create artist
  async create(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const adminId = req.user?.id;

    try {
      const { name, slug, bio, imageUrl, bgImageUrl, spotifyUrl, youtubeUrl } =
        req.body ?? {};

      if (!name || typeof name !== "string") {
        return res.status(400).json({
          status: "error",
          error: "Name is required",
        });
      }

      const finalSlug =
        typeof slug === "string" && slug.trim().length > 0
          ? slug.trim()
          : name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");

      const artist = await repo.create({
        name,
        slug: finalSlug,
        bio,
        imageUrl,
        bgImageUrl,
        spotifyUrl,
        youtubeUrl,
      });

      logger.info(
        {
          event: "artist_create_success",
          adminId,
          artistId: artist.id,
          durationMs: Date.now() - startedAt,
        },
        "Created artist",
      );

      return res.json({ status: "success", data: artist });
    } catch (err: any) {
      logger.error(
        {
          event: "artist_create_error",
          adminId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to create artist",
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  // ADMIN: update artist
  async update(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const adminId = req.user?.id;
    const artistId = req.params.id;

    try {
      const existing = await repo.findById(artistId);
      if (!existing) {
        return res.status(404).json({
          status: "error",
          error: "Artist not found",
        });
      }

      const {
        name,
        slug,
        bio,
        imageUrl,
        bgImageUrl,
        spotifyUrl,
        youtubeUrl,
        isVerified,
      } = req.body ?? {};

      const update: any = {};
      if (typeof name === "string") update.name = name;
      if (typeof slug === "string") update.slug = slug;
      if (typeof bio !== "undefined") update.bio = bio;
      if (typeof imageUrl !== "undefined") update.imageUrl = imageUrl;
      if (typeof bgImageUrl !== "undefined") update.bgImageUrl = bgImageUrl;
      if (typeof spotifyUrl !== "undefined") update.spotifyUrl = spotifyUrl;
      if (typeof youtubeUrl !== "undefined") update.youtubeUrl = youtubeUrl;
      if (typeof isVerified !== "undefined") {
        if (typeof isVerified === "boolean") update.isVerified = isVerified;
        else if (isVerified === "true") update.isVerified = true;
        else if (isVerified === "false") update.isVerified = false;
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          status: "error",
          error: "No valid fields to update",
        });
      }

      const updated = await repo.update(artistId, update);

      logger.info(
        {
          event: "artist_update_success",
          adminId,
          artistId,
          durationMs: Date.now() - startedAt,
        },
        "Updated artist",
      );

      return res.json({ status: "success", data: updated });
    } catch (err: any) {
      logger.error(
        {
          event: "artist_update_error",
          adminId,
          artistId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to update artist",
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

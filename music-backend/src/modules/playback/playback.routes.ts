import { Router } from "express";
import { authMiddleware } from "../../middleware/auth"; // adjust path
import { PlaybackService } from "./playback.service";

const playbackService = new PlaybackService();

export function registerPlaybackRoutes(router: Router) {
  const r = Router();

  // POST /v1/playback/start
  r.post("/start", authMiddleware, async (req: any, res, next) => {
    try {
      const userId = req.user?.id;
      const { trackId, source } = req.body ?? {};

      if (!trackId || typeof trackId !== "string") {
        return res.status(400).json({ message: "trackId is required" });
      }

      const result = await playbackService.startPlayback({
        userId,
        trackId,
        source,
      });

      return res.json({
        eventCreated: result.eventCreated,
        event: result.event ?? null,
        track: {
          id: result.track.id,
          title: result.track.title,
          artist: result.track.artist,
          album: result.track.album,
          duration: result.track.duration,
          genre: result.track.genre,
          isExplicit: result.track.isExplicit,
          playCount: result.track.playCount,
          fileUrl: result.track.fileUrl,
          coverArtUrl: result.track.coverArtUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/me/recently-played
  r.get("/me/recently-played", authMiddleware, async (req: any, res, next) => {
    try {
      const userId = req.user?.id;
      const limit = Math.min(Number(req.query.limit ?? 20), 50);
      const offset = Math.max(Number(req.query.offset ?? 0), 0);

      const items = await playbackService.getRecentlyPlayed({
        userId,
        limit,
        offset,
      });

      return res.json({
        limit,
        offset,
        items,
      });
    } catch (err) {
      next(err);
    }
  });

  // mount under /v1/playback
  router.use("/v1/playback", r);
}

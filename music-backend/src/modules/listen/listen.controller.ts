import { Response } from "express";
import { ListenRepository } from "./listen.repository";
import { AuthenticatedRequest } from "../../middleware/auth";
import { logger } from "../../config/logger";

const repo = new ListenRepository();

export const ListenController = {
  async recordListen(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const body = req.body;

    if (!userId) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      const { trackId, playlistId, completionPercentage, duration, platform, deviceId } = body;

      if (!trackId) {
        return res.status(400).json({
          status: "error",
          error: "trackId is required",
        });
      }

      logger.info(
        {
          event: "listen_record_request",
          userId,
          trackId,
          playlistId,
          completionPercentage,
        },
        "Recording listen event"
      );

      const record = await repo.recordListen({
        userId,
        trackId,
        playlistId,
        completionPercentage,
        duration,
        platform,
        deviceId,
      });

      logger.info(
        {
          event: "listen_record_success",
          userId,
          trackId,
          listenId: record.id,
          durationMs: Date.now() - startedAt,
        },
        "Listen recorded"
      );

      return res.status(201).json({
        status: "success",
        data: record,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "listen_record_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to record listen"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async getHistory(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      const history = await repo.getUserListenHistory(userId);

      logger.info(
        {
          event: "listen_history_success",
          userId,
          count: history.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched listen history"
      );

      return res.json({
        status: "success",
        data: history,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "listen_history_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch listen history"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async getRecentlyPlayed(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      const recent = await repo.getRecentlyPlayed(userId);

      logger.info(
        {
          event: "recently_played_success",
          userId,
          count: recent.length,
          durationMs: Date.now() - startedAt,
        },
        "Fetched recently played"
      );

      return res.json({
        status: "success",
        data: recent,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "recently_played_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch recently played"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

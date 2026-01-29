import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AdminUserRepository } from "./admin-user.repository";
import { logger } from "../../config/logger";

const repo = new AdminUserRepository();

export const AdminUserController = {
  async listUsers(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const { limit, offset, search, banned } = req.query;

    try {
      const users = await repo.listUsers({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        search: search as string,
        banned: banned === "true" ? true : banned === "false" ? false : undefined,
      });

      logger.info(
        {
          event: "admin_users_list_success",
          count: users.length,
          durationMs: Date.now() - startedAt,
        },
        "Admin fetched users"
      );

      return res.json({
        status: "success",
        data: users,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_users_list_error",
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to list users"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async getUserDetails(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.params.id;

    try {
      const details = await repo.getUserDetails(userId);

      if (!details) {
        return res.status(404).json({
          status: "error",
          error: "User not found",
        });
      }

      const [listenHistory, playlists] = await Promise.all([
        repo.getUserListenHistory(userId),
        repo.getUserPlaylists(userId),
      ]);

      logger.info(
        {
          event: "admin_user_details_success",
          userId,
          durationMs: Date.now() - startedAt,
        },
        "Admin fetched user details"
      );

      return res.json({
        status: "success",
        data: {
          ...details,
          listenHistory,
          playlists,
        },
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_user_details_error",
          userId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch user details"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async banUser(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.params.id;
    const adminId = req.user?.id;

    try {
      const updated = await repo.banUser(userId);

      if (!updated) {
        return res.status(404).json({
          status: "error",
          error: "User not found",
        });
      }

      logger.info(
        {
          event: "admin_user_ban_success",
          adminId,
          userId,
          durationMs: Date.now() - startedAt,
        },
        "User banned"
      );

      return res.json({
        status: "success",
        message: "User banned successfully",
        data: updated,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_user_ban_error",
          adminId,
          userId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to ban user"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async unbanUser(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.params.id;
    const adminId = req.user?.id;

    try {
      const updated = await repo.unbanUser(userId);

      if (!updated) {
        return res.status(404).json({
          status: "error",
          error: "User not found",
        });
      }

      logger.info(
        {
          event: "admin_user_unban_success",
          adminId,
          userId,
          durationMs: Date.now() - startedAt,
        },
        "User unbanned"
      );

      return res.json({
        status: "success",
        message: "User unbanned successfully",
        data: updated,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_user_unban_error",
          adminId,
          userId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to unban user"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();

    try {
      const stats = await repo.getDashboardStats();

      logger.info(
        {
          event: "admin_dashboard_stats_success",
          durationMs: Date.now() - startedAt,
        },
        "Admin fetched dashboard stats"
      );

      return res.json({
        status: "success",
        data: stats,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "admin_dashboard_stats_error",
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch dashboard stats"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

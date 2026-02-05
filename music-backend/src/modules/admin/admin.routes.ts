import { Router } from "express";
import { AdminTrackController } from "./admin-track.controller";
import { IngestionJobController } from "./ingestion-job.controller";
import { AdminUserController } from "./admin-user.controller";
import { authMiddleware } from "../../middleware/auth";
import { adminAuthMiddleware } from "../../middleware/adminAuth";
import { EditorialPlaylistController } from "./editorial-playlist.controller";
import { AdminMusicRequestController } from "./admin-music-request.controller";


export function registerAdminRoutes(router: Router) {
  const adminAuth = [authMiddleware, adminAuthMiddleware];

  // Dashboard
  router.get(
    "/v1/admin/dashboard/stats",
    ...adminAuth,
    AdminUserController.getDashboardStats,
  );

  // Track management
  router.post(
    "/v1/admin/tracks",
    ...adminAuth,
    AdminTrackController.uploadMiddleware,
    AdminTrackController.uploadTrack,
  );
  router.get("/v1/admin/tracks", ...adminAuth, AdminTrackController.listTracks);
  router.delete(
    "/v1/admin/tracks/:id",
    ...adminAuth,
    AdminTrackController.deleteTrack,
  );

  // Ingestion jobs
  router.post(
    "/v1/admin/ingestion-jobs",
    ...adminAuth,
    IngestionJobController.createJob,
  );
  router.get(
    "/v1/admin/ingestion-jobs",
    ...adminAuth,
    IngestionJobController.listJobs,
  );
  router.get(
    "/v1/admin/ingestion-jobs/:id",
    ...adminAuth,
    IngestionJobController.getJobById,
  );
  router.post(
    "/v1/admin/ingestion-jobs/:id/retry",
    ...adminAuth,
    IngestionJobController.retryJob,
  );
  router.delete(
    "/v1/admin/ingestion-jobs/:id",
    ...adminAuth,
    IngestionJobController.deleteJob,
  );

  // User management
  router.get("/v1/admin/users", ...adminAuth, AdminUserController.listUsers);
  router.get(
    "/v1/admin/users/:id",
    ...adminAuth,
    AdminUserController.getUserDetails,
  );
  router.post(
    "/v1/admin/users/:id/ban",
    ...adminAuth,
    AdminUserController.banUser,
  );
  router.post(
    "/v1/admin/users/:id/unban",
    ...adminAuth,
    AdminUserController.unbanUser,
  );

  router.post(
    "/v1/admin/editorial-playlists",
    ...adminAuth,
    EditorialPlaylistController.create,
  );
  router.patch(
    "/v1/admin/editorial-playlists/:id",
    ...adminAuth,
    EditorialPlaylistController.update,
  );
  router.post(
    "/v1/admin/editorial-playlists/:id/tracks",
    ...adminAuth,
    EditorialPlaylistController.setTracks,
  );
  // Trending auto playlist
  router.post(
    "/v1/admin/editorial-playlists/trending/refresh",
    ...adminAuth,
    EditorialPlaylistController.refreshTrending,
  );

  // Music requests (user requests to admin)
  router.get(
    "/v1/admin/music-requests",
    ...adminAuth,
    AdminMusicRequestController.list,
  );
  router.get(
    "/v1/admin/music-requests/:id",
    ...adminAuth,
    AdminMusicRequestController.getById,
  );
  router.patch(
    "/v1/admin/music-requests/:id",
    ...adminAuth,
    AdminMusicRequestController.update,
  );
}

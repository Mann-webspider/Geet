import { Router } from "express";
import { AdminTrackController } from "./admin-track.controller";
import { authMiddleware } from "../../middleware/auth";
import { adminAuthMiddleware } from "../../middleware/adminAuth";

export function registerAdminRoutes(router: Router) {
  // All admin routes require both auth and admin check
  const adminAuth = [authMiddleware, adminAuthMiddleware];

  // Track management
  router.post(
    "/v1/admin/tracks",
    ...adminAuth,
    AdminTrackController.uploadMiddleware,
    AdminTrackController.uploadTrack
  );
  router.get("/v1/admin/tracks", ...adminAuth, AdminTrackController.listTracks);
  router.delete("/v1/admin/tracks/:id", ...adminAuth, AdminTrackController.deleteTrack);
}

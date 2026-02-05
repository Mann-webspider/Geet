import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { MusicRequestController } from "./music-request.controller";

export function registerMusicRequestRoutes(router: Router) {
  router.post(
    "/v1/music-requests",
    authMiddleware,
    MusicRequestController.create,
  );
  router.get(
    "/v1/music-requests",
    authMiddleware,
    MusicRequestController.listMine,
  );
  router.get(
    "/v1/music-requests/:id",
    authMiddleware,
    MusicRequestController.getMineById,
  );
}

import { Router } from "express";
import { TrackController } from "./track.controller";
import { authMiddleware } from "../../middleware/auth";

export function registerTrackRoutes(router: Router) {
  router.get("/v1/tracks", authMiddleware, TrackController.list);
  router.get("/v1/tracks/search", authMiddleware, TrackController.search);

   router.patch("/v1/tracks/:id", authMiddleware, TrackController.edit);
   router.get("/v1/tracks/:id", authMiddleware, TrackController.getById);
}
    
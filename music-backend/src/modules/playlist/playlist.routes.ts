import { Router } from "express";
import { PlaylistController } from "./playlist.controller";
import { PlaylistTracksController } from "./playlist-tracks.controller";
import { authMiddleware } from "../../middleware/auth";

export function registerPlaylistRoutes(router: Router) {
  router.get("/v1/playlists/mine", authMiddleware, PlaylistController.listMine);
  router.post("/v1/playlists", authMiddleware, PlaylistController.create);
  router.get("/v1/playlists/:id", authMiddleware, PlaylistController.getById);
  router.patch("/v1/playlists/:id", authMiddleware, PlaylistController.update);
  router.delete("/v1/playlists/:id", authMiddleware, PlaylistController.delete);

  // Playlist tracks
  router.post("/v1/playlists/:id/tracks", authMiddleware, PlaylistTracksController.addTrack);
  router.delete("/v1/playlists/:id/tracks/:trackId", authMiddleware, PlaylistTracksController.removeTrack);
}

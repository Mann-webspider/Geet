import { type Express, Router } from "express";
import { registerAuthRoutes } from "../modules/auth/auth.routes";
import { registerPlaylistRoutes } from "../modules/playlist/playlist.routes";
import { registerTrackRoutes } from "../modules/track/track.routes";


export function setupRoutes(app: Express) {
  const router = Router();

  registerAuthRoutes(router);
  registerPlaylistRoutes(router);
  registerTrackRoutes(router);

  app.use(router);
}

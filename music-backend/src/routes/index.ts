import { type Express, Router } from "express";
import { registerAuthRoutes } from "../modules/auth/auth.routes";
import { registerPlaylistRoutes } from "../modules/playlist/playlist.routes";
import { registerTrackRoutes } from "../modules/track/track.routes";
import { registerListenRoutes } from "../modules/listen/listen.routes";
import { registerAdminRoutes } from "../modules/admin/admin.routes";
import { registerPlaybackRoutes } from "../modules/playback/playback.routes";


export function setupRoutes(app: Express) {
  const router = Router();

  registerAuthRoutes(router);
  registerPlaylistRoutes(router);
  registerTrackRoutes(router);
  registerListenRoutes(router);
  registerAdminRoutes(router);
 registerPlaybackRoutes(router);
  app.use(router);
}

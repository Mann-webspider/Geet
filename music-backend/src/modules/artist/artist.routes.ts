import { Router } from "express";
import { ArtistController } from "./artist.controller";
import { authMiddleware } from "../../middleware/auth";

import { adminAuthMiddleware } from "../../middleware/adminAuth";

export function registerArtistRoutes(router: Router) {
    const adminAuth = [authMiddleware, adminAuthMiddleware];
    
  const r = Router();

  // USER endpoints (require auth if your app does that for all)
  r.get("/artists", authMiddleware, ArtistController.list);
  r.get("/artists/top", authMiddleware, ArtistController.top);
  r.get("/artists/:id", authMiddleware, ArtistController.get); // id or slug

  // ADMIN endpoints
  r.post("/admin/artists", authMiddleware, adminAuth, ArtistController.create);
  r.patch(
    "/admin/artists/:id",
    authMiddleware,
    adminAuth,
    ArtistController.update,
  );

  router.use("/v1", r);
}

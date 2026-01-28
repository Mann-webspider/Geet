import { Router } from "express";
import { ListenController } from "./listen.controller";
import { authMiddleware } from "../../middleware/auth";

export function registerListenRoutes(router: Router) {
  router.post("/v1/listens", authMiddleware, ListenController.recordListen);
  router.get("/v1/listens/history", authMiddleware, ListenController.getHistory);
  router.get("/v1/listens/recent", authMiddleware, ListenController.getRecentlyPlayed);
}

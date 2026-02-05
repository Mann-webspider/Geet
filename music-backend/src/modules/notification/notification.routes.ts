import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { NotificationController } from "./notification.controller";

export function registerNotificationRoutes(router: Router) {
  router.get(
    "/v1/notifications",
    authMiddleware,
    NotificationController.listMine,
  );
  router.post(
    "/v1/notifications/:id/read",
    authMiddleware,
    NotificationController.markRead,
  );
}

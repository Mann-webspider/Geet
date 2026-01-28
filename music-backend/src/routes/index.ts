import { type Express, Router } from "express";
import { registerAuthRoutes } from "../modules/auth/auth.routes";

export function setupRoutes(app: Express) {
  const router = Router();

  // Auth
  registerAuthRoutes(router);

  app.use(router);
}

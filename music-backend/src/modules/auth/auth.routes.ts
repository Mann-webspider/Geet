import { Router } from "express";
import { AuthController } from "./auth.controller";

export function registerAuthRoutes(router: Router) {
  router.post("/v1/auth/signup", AuthController.signup);
  router.post("/v1/auth/login", AuthController.login);
  router.get("/v1/auth/me", AuthController.me);
}

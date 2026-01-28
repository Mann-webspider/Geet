
import type { Request, Response } from "express";
import { AuthRepository } from "./auth.repository";
import { hashPassword, verifyPassword } from "./password.util.";
import { signToken } from "./jwt.util";
import { logger } from "../../config/logger";
import type { LoginRequest, SignupRequest } from "./auth.types";

const authRepo = new AuthRepository();

export const AuthController = {
  async signup(req: Request, res: Response) {
    const startedAt = Date.now();
    const body = req.body as SignupRequest;

    try {
      logger.info(
        {
          event: "auth_signup_request",
          email: body.email,
          username: body.username,
          ip:
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            null,
          path: req.originalUrl || req.url,
          method: req.method,
        },
        "Signup request received"
      );

      // Basic input sanity check
      if (!body.email || !body.password || !body.username) {
        logger.warn(
          {
            event: "auth_signup_invalid_payload",
            email: body.email,
          },
          "Missing required signup fields"
        );
        return res.status(400).json({
          status: "error",
          error: "email, username and password are required",
        });
      }

      // Check if user exists
      const existing = await authRepo.findByEmail(body.email);
      if (existing) {
        logger.warn(
          {
            event: "auth_signup_email_taken",
            email: body.email,
            userId: existing.id,
          },
          "Signup failed: email already in use"
        );
        return res.status(409).json({
          status: "error",
          error: "Email already in use",
        });
      }

      const passwordHash = await hashPassword(body.password);

      const user = await authRepo.createUser({
        email: body.email,
        username: body.username,
        passwordHash,
      });

      if (!user) {
        throw new Error("User creation failed");
      }

      const token = signToken(user.id);

      logger.info(
        {
          event: "auth_signup_success",
          userId: user.id,
          email: user.email,
          durationMs: Date.now() - startedAt,
        },
        "User signed up successfully"
      );

      return res.status(201).json({
        status: "success",
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          token,
        },
      });
    } catch (error: any) {
      logger.error(
        {
          event: "auth_signup_error",
          error: error?.message,
          stack: error?.stack,
          email: body.email,
          durationMs: Date.now() - startedAt,
        },
        "Signup failed with server error"
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async login(req: Request, res: Response) {
    const startedAt = Date.now();
    const body = req.body as LoginRequest;

    try {
      logger.info(
        {
          event: "auth_login_request",
          email: body.email,
          ip:
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            null,
          path: req.originalUrl || req.url,
          method: req.method,
        },
        "Login request received"
      );

      if (!body.email || !body.password) {
        logger.warn(
          {
            event: "auth_login_invalid_payload",
            email: body.email,
          },
          "Missing email or password"
        );
        return res.status(400).json({
          status: "error",
          error: "email and password are required",
        });
      }

      const user = await authRepo.findByEmail(body.email);
      if (!user) {
        logger.warn(
          {
            event: "auth_login_user_not_found",
            email: body.email,
          },
          "Login failed: user not found"
        );
        return res.status(401).json({
          status: "error",
          error: "Invalid credentials",
        });
      }

      const ok = await verifyPassword(body.password, user.passwordHash);
      if (!ok) {
        logger.warn(
          {
            event: "auth_login_invalid_password",
            userId: user.id,
            email: user.email,
          },
          "Login failed: invalid password"
        );
        return res.status(401).json({
          status: "error",
          error: "Invalid credentials",
        });
      }

      const token = signToken(user.id);

      logger.info(
        {
          event: "auth_login_success",
          userId: user.id,
          email: user.email,
          durationMs: Date.now() - startedAt,
        },
        "User logged in successfully"
      );

      return res.json({
        status: "success",
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          token,
        },
      });
    } catch (error: any) {
      logger.error(
        {
          event: "auth_login_error",
          error: error?.message,
          stack: error?.stack,
          email: body.email,
          durationMs: Date.now() - startedAt,
        },
        "Login failed with server error"
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async me(req: Request, res: Response) {
    const startedAt = Date.now();

    try {
      const userId = (req as any).user?.id as string | undefined;

      logger.info(
        {
          event: "auth_me_request",
          userId,
          path: req.originalUrl || req.url,
          method: req.method,
        },
        "Me endpoint called"
      );

      if (!userId) {
        logger.warn(
          {
            event: "auth_me_unauthorized",
          },
          "Me endpoint: missing userId on request"
        );
        return res.status(401).json({
          status: "error",
          error: "Unauthorized",
        });
      }

      const user = await authRepo.findById?.(userId); // add findById to repo
      if (!user) {
        logger.warn(
          {
            event: "auth_me_user_not_found",
            userId,
          },
          "Me endpoint: user not found"
        );
        return res.status(404).json({
          status: "error",
          error: "User not found",
        });
      }

      logger.info(
        {
          event: "auth_me_success",
          userId: user.id,
          durationMs: Date.now() - startedAt,
        },
        "Me endpoint succeeded"
      );

      return res.json({
        status: "success",
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error: any) {
      logger.error(
        {
          event: "auth_me_error",
          error: error?.message,
          stack: error?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Me endpoint failed"
      );

      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

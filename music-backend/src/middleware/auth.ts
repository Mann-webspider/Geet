import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../modules/auth/jwt.util";
import { logger } from "../config/logger";
import { db } from "../config/db";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const startedAt = Date.now();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn(
      {
        event: "auth_middleware_missing_token",
        path: req.originalUrl || req.url,
        method: req.method,
      },
      "Auth middleware: missing or invalid Authorization header"
    );

    return res.status(401).json({
      status: "error",
      error: "Unauthorized",
    });
  }

  const token = authHeader.substring("Bearer ".length).trim();

  try {
    const { userId } = verifyToken(token);

    // NEW: Check if user is banned
    const [user] = await db
      .select({ isBanned: users.isBanned })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user?.isBanned) {
      logger.warn(
        {
          event: "auth_middleware_user_banned",
          userId,
        },
        "Banned user attempted access"
      );
      return res.status(403).json({
        status: "error",
        error: "Account has been suspended",
      });
    }

    req.user = { id: userId };

    logger.info(
      {
        event: "auth_middleware_verified",
        userId,
        path: req.originalUrl || req.url,
        method: req.method,
        durationMs: Date.now() - startedAt,
      },
      "Auth middleware: token verified"
    );

    return next();
  } catch (error: any) {
    logger.warn(
      {
        event: "auth_middleware_invalid_token",
        error: error?.message,
        path: req.originalUrl || req.url,
        method: req.method,
        durationMs: Date.now() - startedAt,
      },
      "Auth middleware: invalid token"
    );

    return res.status(401).json({
      status: "error",
      error: "Invalid or expired token",
    });
  }
}

    
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { logger } from "../config/logger";
import { db } from "../config/db";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

export async function adminAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn(
      { event: "admin_auth_no_user" },
      "Admin route accessed without auth"
    );
    return res.status(401).json({
      status: "error",
      error: "Unauthorized",
    });
  }

  try {
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      logger.warn(
        {
          event: "admin_auth_forbidden",
          userId,
        },
        "Non-admin user attempted to access admin route"
      );
      return res.status(403).json({
        status: "error",
        error: "Admin access required",
      });
    }

    logger.info(
      { event: "admin_auth_success", userId },
      "Admin access granted"
    );

    next();
  } catch (err: any) {
    logger.error(
      {
        event: "admin_auth_error",
        userId,
        error: err?.message,
      },
      "Admin auth check failed"
    );
    return res.status(500).json({
      status: "error",
      error: "Internal server error",
    });
  }
}

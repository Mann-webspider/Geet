import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../modules/auth/jwt.util";
import { logger } from "../config/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export function authMiddleware(
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
        ip:
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.socket.remoteAddress ||
          null,
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
    
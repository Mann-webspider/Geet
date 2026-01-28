import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  // When response finishes, log details
  res.on("finish", () => {
    const durationMs = Date.now() - start;

    const userId = (req as any).user?.id ?? null; // later set from auth middleware
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    logger.info({
      event: "http_request",
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      ip,
      userId,
      userAgent: req.headers["user-agent"],
      referer: req.headers["referer"] || req.headers["referrer"],
      durationMs,
    });
  });

  next();
}

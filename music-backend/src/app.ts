import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { setupRoutes } from "./routes";
import { requestLogger } from "./middleware/requestLogger";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/media", express.static(path.join(process.cwd(), "media")));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/v1/app-config", (req, res) => {
    res.json({
      apiVersion: "1.0.0",
      minSupportedAppVersion: "1.0.0",
      features: {
        auth: true,
        streaming: false,
        playlists: false,
      },
    });
  });

  setupRoutes(app);

  return app;
}

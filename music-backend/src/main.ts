import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Backend running on http://localhost:${env.PORT}`);
});

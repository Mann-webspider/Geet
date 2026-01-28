import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 8080),
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:password@localhost:5432/music_db",
  JWT_SECRET: process.env.JWT_SECRET ?? "secret",
  // db, redis etc. will be added later
};

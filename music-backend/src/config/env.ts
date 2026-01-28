import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 8080),
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:password@localhost:5432/music_db",
  JWT_SECRET: process.env.JWT_SECRET ?? "secret",
   STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
  LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH ?? "./media",
  LOCAL_STORAGE_URL: process.env.LOCAL_STORAGE_URL ?? "http://localhost:8080/media",
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  // db, redis etc. will be added later
};

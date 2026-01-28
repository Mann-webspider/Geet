import { StorageClient } from "./storage.interface";
import { LocalStorageClient } from "./local-storage";
import { S3StorageClient } from "./s3-storage";
import { env } from "../../config/env";

let storageClient: StorageClient;

export function getStorageClient(): StorageClient {
  if (!storageClient) {
    storageClient =
      env.STORAGE_DRIVER === "s3"
        ? new S3StorageClient()
        : new LocalStorageClient();
  }
  return storageClient;
}

export * from "./storage.interface";

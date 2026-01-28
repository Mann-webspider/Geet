import fs from "fs/promises";
import path from "path";
import { StorageClient } from "./storage.interface";
import { env } from "../../config/env";

export class LocalStorageClient implements StorageClient {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = env.LOCAL_STORAGE_PATH || "./media";
    this.baseUrl = env.LOCAL_STORAGE_URL || "http://localhost:8080/media";
  }

  async saveFile(params: {
    path: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<string> {
    const fullPath = path.join(this.basePath, params.path);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, params.buffer);

    return this.getFileUrl(params.path);
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await fs.unlink(fullPath);
  }

  getFileUrl(filePath: string): string {
    return `${this.baseUrl}/${filePath}`;
  }
}

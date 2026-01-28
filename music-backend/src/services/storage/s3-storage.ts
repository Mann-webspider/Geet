import { StorageClient } from "./storage.interface";
import { env } from "../../config/env";

export class S3StorageClient implements StorageClient {
  // TODO: Implement using AWS SDK
  async saveFile(params: {
    path: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<string> {
    throw new Error("S3 storage not yet implemented");
  }

  async deleteFile(path: string): Promise<void> {
    throw new Error("S3 storage not yet implemented");
  }

  getFileUrl(path: string): string {
    return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${path}`;
  }
}

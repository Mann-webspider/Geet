export interface StorageClient {
  saveFile(params: {
    path: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<string>; // Returns public URL

  deleteFile(path: string): Promise<void>;

  getFileUrl(path: string): string;
}

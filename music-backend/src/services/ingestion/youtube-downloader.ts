import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import { logger } from "../../config/logger";

export interface DownloadResult {
  filePath: string;
  metadata: {
    title: string;
    artist: string;
    duration: number;
    thumbnail: string | null;
  };
}

export class YoutubeDownloader {
  private tempDir: string;

  constructor(tempDir = "./temp/downloads") {
    this.tempDir = tempDir;
  }

  async download(url: string): Promise<DownloadResult> {
    await fs.mkdir(this.tempDir, { recursive: true });

    const timestamp = Date.now();
    const outputTemplate = path.join(this.tempDir, `${timestamp}.%(ext)s`);

    const cookiesFromBrowser = process.env.YTDLP_COOKIES_FROM_BROWSER;
    const browserProfile = process.env.YTDLP_BROWSER_PROFILE;

    const baseArgs: string[] = [
      "--no-playlist",
      "--extractor-args",
      "youtube:player_client=android",
      "--geo-bypass",
    ];

    if (cookiesFromBrowser) {
      baseArgs.push("--cookies-from-browser");
      baseArgs.push(browserProfile ? `${cookiesFromBrowser}:${browserProfile}` : cookiesFromBrowser);
    }

    logger.info(
      { event: "youtube_download_start", url, cookiesFromBrowser },
      "Starting YouTube download"
    );

    try {
      const metaRes = await execa("yt-dlp", ["--dump-json", ...baseArgs, url]);
      const metadata = JSON.parse(metaRes.stdout);

      const dlRes = await execa("yt-dlp", [
        ...baseArgs,
        "-f",
        "bestaudio/best",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "-o",
        outputTemplate,
        url,
      ]);

      const downloadedFile = path.join(this.tempDir, `${timestamp}.mp3`);

      const result: DownloadResult = {
        filePath: downloadedFile,
        metadata: {
          title: metadata.title || "Unknown Title",
          artist: metadata.uploader || metadata.channel || "Unknown Artist",
          duration: Math.floor(metadata.duration || 0),
          thumbnail: metadata.thumbnail || null,
        },
      };

      logger.info(
        {
          event: "youtube_download_success",
          url,
          title: result.metadata.title,
          duration: result.metadata.duration,
        },
        "YouTube download completed"
      );

      return result;
    } catch (err: any) {
      logger.error(
        {
          event: "youtube_download_error",
          url,
          error: err?.message,
          stderr: err?.stderr,
          stdout: err?.stdout,
          exitCode: err?.exitCode,
        },
        "YouTube download failed"
      );

      // Preserve stderr/stdout for classifier
      const e = new Error(`YouTube download failed: ${err?.message ?? "unknown"}`) as any;
      e.stderr = err?.stderr;
      e.stdout = err?.stdout;
      e.exitCode = err?.exitCode;
      throw e;
    }
  }

  async cleanup(filePath: string) {
    try {
      await fs.unlink(filePath);
      logger.info({ event: "cleanup_success", filePath }, "Temp file cleaned up");
    } catch {
      logger.warn({ event: "cleanup_error", filePath }, "Failed to cleanup temp file");
    }
  }
}

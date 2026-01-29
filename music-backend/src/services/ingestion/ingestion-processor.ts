import fs from "fs/promises";
import path from "path";
import { IngestionJobRepository } from "../../modules/admin/ingestion-job.repository";
import { AdminTrackRepository } from "../../modules/admin/admin-track.repository";
import { YoutubeDownloader } from "./youtube-downloader";
import { FFmpegTranscoder } from "./ffmpeg-transcoder";
import { getStorageClient } from "../storage";
import { logger } from "../../config/logger";
import { classifyIngestionError } from "./ingestion-errors";

export class IngestionProcessor {
  private jobRepo = new IngestionJobRepository();
  private trackRepo = new AdminTrackRepository();
  private youtubeDownloader = new YoutubeDownloader();
  private transcoder = new FFmpegTranscoder();

  async processJob(jobId: string) {
    const startedAt = Date.now();

    let downloadedPath: string | null = null;
    let transcodeDir: string | null = null;
    let transcodedFiles: string[] = [];

    logger.info({ event: "process_job_start", jobId }, "Processing ingestion job");

    try {
      const result = await this.jobRepo.getJobById(jobId);
      if (!result?.job) throw new Error("Job not found");

      const job = result.job;

      await this.jobRepo.updateJobStatus(jobId, {
        status: "downloading",
        errorCode: null,
        errorMessage: null,
        debugLog: null,
      });

      const downloadResult = await this.youtubeDownloader.download(job.sourceInput);
      downloadedPath = downloadResult.filePath;

      await this.jobRepo.updateJobStatus(jobId, {
        extractedTitle: downloadResult.metadata.title,
        extractedArtist: downloadResult.metadata.artist,
        extractedDuration: downloadResult.metadata.duration,
        extractedThumbnail: downloadResult.metadata.thumbnail,
      });

      await this.jobRepo.updateJobStatus(jobId, { status: "transcoding" });

      transcodeDir = path.join("./temp/transcode", jobId);
      const transcoded = await this.transcoder.transcode({
        inputPath: downloadedPath,
        outputDir: transcodeDir,
        bitrates: [128, 320],
      });

      transcodedFiles = transcoded.map((f) => f.filePath);

      // choose 320k preferred
      const high = transcoded.find((f) => f.bitrate === 320) ?? transcoded[0];

      const buf = await fs.readFile(high.filePath);

      const storage = getStorageClient();
      const timestamp = Date.now();
      const sanitized = (downloadResult.metadata.title || "track")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .substring(0, 60);

      const storagePath = `audio/${timestamp}-${sanitized}.mp3`;
      const fileUrl = await storage.saveFile({
        path: storagePath,
        buffer: buf,
        contentType: "audio/mpeg",
      });

      // thumbnail (best-effort)
      let coverArtUrl: string | null = null;
      if (downloadResult.metadata.thumbnail) {
        try {
          const resp = await fetch(downloadResult.metadata.thumbnail);
          const thumbBuf = Buffer.from(await resp.arrayBuffer());
          const thumbPath = `covers/${timestamp}-${sanitized}.jpg`;

          coverArtUrl = await storage.saveFile({
            path: thumbPath,
            buffer: thumbBuf,
            contentType: "image/jpeg",
          });
        } catch (e: any) {
          logger.warn(
            { event: "thumbnail_download_error", jobId, error: e?.message },
            "Thumbnail fetch failed (non-blocking)"
          );
        }
      }

      const track = await this.trackRepo.createTrack({
        title: downloadResult.metadata.title,
        artist: downloadResult.metadata.artist,
        duration: downloadResult.metadata.duration,
        fileUrl,
        coverArtUrl: coverArtUrl ?? undefined,
      });

      await this.jobRepo.updateJobStatus(jobId, {
        status: "completed",
        trackId: track.id,
        completedAt: new Date(),
      });

      logger.info(
        {
          event: "process_job_success",
          jobId,
          trackId: track.id,
          durationMs: Date.now() - startedAt,
        },
        "Ingestion job completed successfully"
      );
    } catch (err: any) {
      const failure = classifyIngestionError(err);

      logger.error(
        {
          event: "process_job_error",
          jobId,
          error: err?.message,
          code: failure.code,
          durationMs: Date.now() - startedAt,
        },
        "Ingestion job failed"
      );

      // update job to failed
      await this.jobRepo.updateJobStatus(jobId, {
        status: "failed",
        errorCode: failure.code,
        errorMessage: failure.message,
        debugLog: failure.debugLog ?? null,
      });

      // increment retry count (safe)
      await this.jobRepo.incrementRetryCount(jobId);
    } finally {
      // cleanup must never crash worker
      try {
        if (downloadedPath) await this.youtubeDownloader.cleanup(downloadedPath);
      } catch {}

      try {
        if (transcodedFiles.length) await this.transcoder.cleanup(transcodedFiles);
      } catch {}

      try {
        if (transcodeDir) await fs.rm(transcodeDir, { recursive: true, force: true });
      } catch {}
    }
  }
}

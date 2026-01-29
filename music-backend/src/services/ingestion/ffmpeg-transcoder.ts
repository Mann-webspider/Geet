import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import { logger } from "../../config/logger";

export interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  bitrates?: number[]; // e.g., [128, 320]
}

export interface TranscodedFile {
  bitrate: number;
  filePath: string;
  size: number;
}

export class FFmpegTranscoder {
  async transcode(options: TranscodeOptions): Promise<TranscodedFile[]> {
    const { inputPath, outputDir, bitrates = [128, 320] } = options;

    await fs.mkdir(outputDir, { recursive: true });

    const results: TranscodedFile[] = [];

    logger.info(
      {
        event: "transcode_start",
        inputPath,
        bitrates,
      },
      "Starting FFmpeg transcode"
    );

    for (const bitrate of bitrates) {
      const outputFilename = `${path.basename(inputPath, path.extname(inputPath))}_${bitrate}k.mp3`;
      const outputPath = path.join(outputDir, outputFilename);

      try {
        await execa("ffmpeg", [
          "-i",
          inputPath,
          "-codec:a",
          "libmp3lame",
          "-b:a",
          `${bitrate}k`,
          "-ar",
          "44100",
          "-y", // overwrite output file
          outputPath,
        ]);

        const stats = await fs.stat(outputPath);

        results.push({
          bitrate,
          filePath: outputPath,
          size: stats.size,
        });

        logger.info(
          {
            event: "transcode_success",
            bitrate,
            outputPath,
            size: stats.size,
          },
          "Transcode completed for bitrate"
        );
      } catch (err: any) {
        logger.error(
          {
            event: "transcode_error",
            bitrate,
            error: err?.message,
            stderr: err?.stderr,
          },
          "Transcode failed for bitrate"
        );
        throw new Error(`FFmpeg transcode failed at ${bitrate}k: ${err.message}`);
      }
    }

    logger.info(
      {
        event: "transcode_complete",
        inputPath,
        outputCount: results.length,
      },
      "All transcodes completed"
    );

    return results;
  }

  async cleanup(filePaths: string[]) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        logger.warn({ event: "cleanup_error", filePath }, "Failed to cleanup file");
      }
    }
  }
}

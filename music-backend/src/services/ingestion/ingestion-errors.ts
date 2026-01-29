export type IngestionErrorCode =
  | "YT_DOWNLOAD_403"
  | "YT_DOWNLOAD_UNAVAILABLE"
  | "YT_DLP_NOT_FOUND"
  | "FFMPEG_NOT_FOUND"
  | "FFMPEG_FAILED"
  | "STORAGE_FAILED"
  | "DB_FAILED"
  | "UNKNOWN";

export interface IngestionFailure {
  code: IngestionErrorCode;
  message: string;      // admin-friendly
  debugLog?: string;    // raw stderr/stdout truncated
}

function truncate(s: string, max = 5000) {
  if (!s) return s;
  return s.length > max ? s.slice(0, max) + "\n...[truncated]" : s;
}

export function classifyIngestionError(err: any): IngestionFailure {
  const msg = String(err?.message ?? "");
  const stderr = String(err?.stderr ?? "");
  const stdout = String(err?.stdout ?? "");

  const combined = `${msg}\nSTDERR:\n${stderr}\nSTDOUT:\n${stdout}`;

  // yt-dlp not found
  if (msg.includes("ENOENT") || msg.toLowerCase().includes("not recognized as an internal or external command")) {
    if (msg.includes("yt-dlp")) {
      return {
        code: "YT_DLP_NOT_FOUND",
        message: "yt-dlp binary not found. Install/upgrade yt-dlp on the worker machine.",
        debugLog: truncate(combined),
      };
    }
    if (msg.includes("ffmpeg")) {
      return {
        code: "FFMPEG_NOT_FOUND",
        message: "ffmpeg binary not found. Install ffmpeg on the worker machine.",
        debugLog: truncate(combined),
      };
    }
  }

  // 403 common
  if (combined.includes("HTTP Error 403") || combined.toLowerCase().includes("403: forbidden")) {
    return {
      code: "YT_DOWNLOAD_403",
      message:
        "YouTube blocked the download (HTTP 403). Try enabling cookies-from-browser, updating yt-dlp, or using another URL.",
      debugLog: truncate(combined),
    };
  }

  // video unavailable etc.
  if (combined.toLowerCase().includes("video unavailable") || combined.toLowerCase().includes("private video")) {
    return {
      code: "YT_DOWNLOAD_UNAVAILABLE",
      message: "Video is unavailable/private/age-restricted. Try another source or provide cookies.",
      debugLog: truncate(combined),
    };
  }

  // ffmpeg errors
  if (combined.toLowerCase().includes("ffmpeg") && combined.toLowerCase().includes("error")) {
    return {
      code: "FFMPEG_FAILED",
      message: "FFmpeg transcoding failed. Check input file and ffmpeg installation.",
      debugLog: truncate(combined),
    };
  }

  // fallback
  return {
    code: "UNKNOWN",
    message: "Ingestion failed due to an unknown error. Check debug log for details.",
    debugLog: truncate(combined),
  };
}

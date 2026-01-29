import { type Response } from "express";
import { type AuthenticatedRequest } from "../../middleware/auth";
import { IngestionJobRepository } from "./ingestion-job.repository";
import { logger } from "../../config/logger";

const repo = new IngestionJobRepository();

export const IngestionJobController = {
  async createJob(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const userId = req.user?.id;
    const body = req.body;

    if (!userId) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    try {
      const { sourceType, sourceInput } = body;

      if (!sourceType || !sourceInput) {
        return res.status(400).json({
          status: "error",
          error: "sourceType and sourceInput are required",
        });
      }

      if (!["youtube", "torrent", "manual"].includes(sourceType)) {
        return res.status(400).json({
          status: "error",
          error: "sourceType must be youtube, torrent, or manual",
        });
      }

      logger.info(
        {
          event: "ingestion_job_create_request",
          userId,
          sourceType,
          sourceInput: sourceInput.substring(0, 100), // truncate for log
        },
        "Admin creating ingestion job"
      );

      const job = await repo.createJob({
        sourceType,
        sourceInput,
        requestedByAdminId: userId,
      });

      logger.info(
        {
          event: "ingestion_job_create_success",
          userId,
          jobId: job.id,
          durationMs: Date.now() - startedAt,
        },
        "Ingestion job created"
      );

      return res.status(201).json({
        status: "success",
        data: job,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "ingestion_job_create_error",
          userId,
          error: err?.message,
          stack: err?.stack,
          durationMs: Date.now() - startedAt,
        },
        "Failed to create ingestion job"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async listJobs(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const { limit, offset, status } = req.query;

    try {
      const jobs = await repo.listJobs({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        status: status as string,
      });

      logger.info(
        {
          event: "ingestion_jobs_list_success",
          count: jobs.length,
          durationMs: Date.now() - startedAt,
        },
        "Admin fetched ingestion jobs"
      );

      return res.json({
        status: "success",
        data: jobs,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "ingestion_jobs_list_error",
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to list ingestion jobs"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async getJobById(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const jobId = req.params.id;

    try {
      const result = await repo.getJobById(jobId);

      if (!result) {
        return res.status(404).json({
          status: "error",
          error: "Job not found",
        });
      }

      logger.info(
        {
          event: "ingestion_job_get_success",
          jobId,
          durationMs: Date.now() - startedAt,
        },
        "Fetched ingestion job"
      );

      return res.json({
        status: "success",
        data: result,
      });
    } catch (err: any) {
      logger.error(
        {
          event: "ingestion_job_get_error",
          jobId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to fetch ingestion job"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async retryJob(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const jobId = req.params.id;
    const userId = req.user?.id;

    try {
      const result = await repo.getJobById(jobId);

      if (!result) {
        return res.status(404).json({
          status: "error",
          error: "Job not found",
        });
      }

      if (result.job.status !== "failed") {
        return res.status(400).json({
          status: "error",
          error: "Only failed jobs can be retried",
        });
      }

      await repo.updateJobStatus(jobId, {
        status: "pending",
        errorMessage: null,
      });

      logger.info(
        {
          event: "ingestion_job_retry_success",
          userId,
          jobId,
          durationMs: Date.now() - startedAt,
        },
        "Ingestion job reset to pending"
      );

      return res.json({
        status: "success",
        message: "Job queued for retry",
      });
    } catch (err: any) {
      logger.error(
        {
          event: "ingestion_job_retry_error",
          userId,
          jobId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to retry job"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },

  async deleteJob(req: AuthenticatedRequest, res: Response) {
    const startedAt = Date.now();
    const jobId = req.params.id;
    const userId = req.user?.id;

    try {
      const deleted = await repo.deleteJob(jobId);

      if (!deleted) {
        return res.status(404).json({
          status: "error",
          error: "Job not found",
        });
      }

      logger.info(
        {
          event: "ingestion_job_delete_success",
          userId,
          jobId,
          durationMs: Date.now() - startedAt,
        },
        "Ingestion job deleted"
      );

      return res.json({
        status: "success",
        message: "Job deleted successfully",
      });
    } catch (err: any) {
      logger.error(
        {
          event: "ingestion_job_delete_error",
          userId,
          jobId,
          error: err?.message,
          durationMs: Date.now() - startedAt,
        },
        "Failed to delete job"
      );
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  },
};

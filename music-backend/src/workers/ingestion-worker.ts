import { IngestionJobRepository } from "../modules/admin/ingestion-job.repository";
import { IngestionProcessor } from "../services/ingestion/ingestion-processor";
import { logger } from "../config/logger";

const POLL_INTERVAL = 10000; // 10 seconds
const MAX_CONCURRENT_JOBS = 2;

class IngestionWorker {
  private jobRepo: IngestionJobRepository;
  private processor: IngestionProcessor;
  private isRunning = false;
  private activeJobs = 0;

  constructor() {
    this.jobRepo = new IngestionJobRepository();
    this.processor = new IngestionProcessor();
  }

  async start() {
    this.isRunning = true;

    logger.info({ event: "worker_start" }, "Ingestion worker started");

    while (this.isRunning) {
      try {
        if (this.activeJobs < MAX_CONCURRENT_JOBS) {
          const jobs = await this.jobRepo.findPendingJobs(
            MAX_CONCURRENT_JOBS - this.activeJobs
          );

          for (const job of jobs) {
            this.activeJobs++;

            // Process job in background
            this.processor
              .processJob(job.id)
              .catch((err) => {
                logger.error(
                  {
                    event: "worker_process_error",
                    jobId: job.id,
                    error: err?.message,
                  },
                  "Failed to process job"
                );
              })
              .finally(() => {
                this.activeJobs--;
              });
          }
        }

        await this.sleep(POLL_INTERVAL);
      } catch (err: any) {
        logger.error(
          {
            event: "worker_poll_error",
            error: err?.message,
          },
          "Worker poll failed"
        );

        await this.sleep(POLL_INTERVAL);
      }
    }
  }

  stop() {
    logger.info({ event: "worker_stop" }, "Stopping ingestion worker");
    this.isRunning = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run worker if this file is executed directly
if (import.meta.main) {
  const worker = new IngestionWorker();

  process.on("SIGINT", () => {
    worker.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    worker.stop();
    process.exit(0);
  });

  worker.start().catch((err) => {
    logger.error({ event: "worker_fatal_error", error: err }, "Worker crashed");
    process.exit(1);
  });
}

export { IngestionWorker };

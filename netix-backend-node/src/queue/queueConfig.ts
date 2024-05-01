import { QueueOptions, WorkerOptions } from 'bullmq';
import { Redis } from 'ioredis';

export enum QueueNames {
  VIDEO_UPLOAD_PROCESSING = 'queue.video-upload-processing',
}

export const defaultQueueOptions = (redisConnection: Redis): QueueOptions => {
  return {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 5,
    },
  };
};

export const defaultWorkerOptions = (redisConnection: Redis): WorkerOptions => {
  return {
    connection: redisConnection,
    // concurrency: 5,
  };
};

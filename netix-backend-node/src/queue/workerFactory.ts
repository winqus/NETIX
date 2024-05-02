import { Processor, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { defaultWorkerOptions } from './queueConfig';

export function createWorker(queue: Queue, processFunction: Processor, redisConnection: Redis) {
  const worker = new Worker(queue.name, processFunction, defaultWorkerOptions(redisConnection));

  worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`${job!.id} has failed with ${err.message}`);
  });

  return worker;
}

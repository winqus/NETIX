import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { defaultQueueOptions } from './queueConfig';

export function createQueue(queueName: string, redisConnection: Redis): Queue {
  const queue = new Queue(queueName, defaultQueueOptions(redisConnection));

  queue.on('waiting', (jobId) => {
    console.log(`Job ${jobId} in queue ${queueName} is waiting.`);
  });

  return queue;
}

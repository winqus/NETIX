import { Redis } from 'ioredis';
import Container from 'typedi';
// import videoUploadProcessingQueue from '../queue/queues/videoUploadProcessingQueue';
import { NAMES } from '../config/dependencies';
// import processVideoUpload from '../queue/processors/processVideoUpload';
// import { QueueNames } from '../queue/queueConfig';
// import { createQueue } from '../queue/queueFactory';
// import { createWorker } from '../queue/workerFactory';
import { wLoggerInstance as logger } from './logger';

interface DependencyLoaderArgs {
  schemas: { name: string; class: any }[];
  repositories: { name: string; class: any }[];
  services: { name: string; class: any }[];
  redisConnection: Redis;
}

export default ({ schemas, repositories, services, redisConnection }: DependencyLoaderArgs) => {
  try {
    Container.set(NAMES.Logger, logger);

    Container.set(NAMES.Redis, redisConnection);

    // const videoUploadProcessingQueue = createQueue(QueueNames.VIDEO_UPLOAD_PROCESSING, redisConnection);
    // const videoUploadProcessingWorker = createWorker(videoUploadProcessingQueue, processVideoUpload, redisConnection);

    // Container.set(QueueNames.VIDEO_UPLOAD_PROCESSING, videoUploadProcessingQueue);
    // Container.set('VideoUploadProcessingWorker', videoUploadProcessingWorker);

    // Load schemas
    schemas.forEach(({ name, class: SchemaClass }) => {
      Container.set(name, SchemaClass);
    });

    // Load repositories
    repositories.forEach(({ name, class: RepoClass }) => {
      const repoInstance = Container.get(RepoClass);
      Container.set(name, repoInstance);
    });

    // Load services
    services.forEach(({ name, class: ServiceClass }) => {
      const serviceInstance = Container.get(ServiceClass);
      Container.set(name, serviceInstance);
    });
  } catch (error) {
    logger.error(`[DependencyLoader]: ${error}`);
    throw new Error('Failed to load dependencies');
  }
};

// import { Job, Worker } from 'bullmq';
// import Container from 'typedi';
// import { Logger } from 'winston';
// import IVideoUploadService from '../../services/IServices/IVideoUploadService';
// import { defaultWorkerOptions } from '../queueConfig';

// export interface VideoChunkUploadProcessingData {
//   requestId: string;
//   videoId: string;
// }

// const processVideoUpload = async (job: Job<VideoChunkUploadProcessingData>) => {
//   const logger: Logger = Container.get('logger');
//   logger.info(`Processing video upload: ${job.id}`);
//   const videoUploadService: IVideoUploadService = Container.get('VideoUploadService');

//   const result = await videoUploadService.mergeVideoChunks(job.data.requestId);

//   if (result.isFailure) {
//     logger.error(`Error merging video chunks: ${result.error}`);

//     return { success: false };
//   }

//   return { success: true };
// };

// const processVideoUploadWorker = new Worker('videoUploadProcessingQueue', processVideoUpload, defaultWorkerOptions);

// processVideoUploadWorker.on('completed', (job) => {
//   console.log(`${job.id} has completed!`);
// });

// processVideoUploadWorker.on('failed', (job, err) => {
//   console.log(`${job} has failed with ${err.message}`);
// });

// export default processVideoUploadWorker;

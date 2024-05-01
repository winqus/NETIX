// import { Job } from 'bullmq/dist/esm/classes/job';
// import Container from 'typedi';
// import { Logger } from 'winston';

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

// export default processVideoUpload;

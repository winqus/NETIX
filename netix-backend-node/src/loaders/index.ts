import express from 'express';
import dependencyLoader from './dependencyLoader';
import expressLoader from './expressLoader';
import { wLoggerInstance as logger } from './logger';
import mongooseLoader from './mongooseLoader';

export default async (expressApp: express.Application) => {
  const _mongoConnection = await mongooseLoader();
  logger.info('MongoDB loaded ✌️');

  await dependencyLoader({
    schemas: [
      { name: 'VideoMetadataSchema', path: '../persistence/schemas/videoMetadata.schema' },
      { name: 'VideoSchema', path: '../persistence/schemas/video.schema' },
      { name: 'ThumbnailSchema', path: '../persistence/schemas/thumbnail.schema' },
      { name: 'VideoUploadRequestSchema', path: '../persistence/schemas/videoUploadRequest.schema' },
    ],
    controllers: [],
    repositories: [],
    services: [],
  });
  logger.info('Dependencies loaded ✌️');

  await expressLoader(expressApp);
  logger.info('Express loaded ✌️');
};

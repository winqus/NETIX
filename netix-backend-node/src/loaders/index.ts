import express from 'express';
import dependencyLoader from './dependencyLoader';
import expressLoader from './expressLoader';
import { wLoggerInstance as logger } from './logger';

export default async (expressApp: express.Application) => {
  await dependencyLoader({
    schemas: [
      { name: 'VideoMetadataSchema', path: '../persistence/schemas/videoMetadata.schema' },
      { name: 'VideoSchema', path: '../persistence/schemas/video.schema' },
      { name: 'ThumbnailSchema', path: '../persistence/schemas/thumbnail.schema' },
      { name: 'VideoMetadataSchema', path: '../persistence/schemas/videoMetadata.schema' },
    ],
    controllers: [],
    repositories: [],
    services: [],
  });
  logger.info('Dependencies loaded ✌️');

  await expressLoader(expressApp);
  logger.info('Express loaded ✌️');
};

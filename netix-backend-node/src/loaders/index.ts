import express from 'express';
import { dependencyConfig } from './dependencyConfig';
import dependencyLoader from './dependencyLoader';
import expressLoader from './expressLoader';
import { wLoggerInstance as logger } from './logger';
import mongooseLoader from './mongooseLoader';
import redisLoader from './redisLoader';

export default async (expressApp: express.Application) => {
  const _mongoConnection = await mongooseLoader();
  logger.info('MongoDB loaded ✌️');

  const redisConnection = await redisLoader();
  logger.info('Redis loaded ✌️');

  // const dependencyConfig = await import('./dependencyConfig');
  await dependencyLoader({
    ...(dependencyConfig as any),
    redisConnection: redisConnection,
  });
  logger.info('Dependencies loaded ✌️');

  await expressLoader(expressApp);
  logger.info('Express loaded ✌️');
};

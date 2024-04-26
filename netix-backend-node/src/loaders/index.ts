import express from 'express';
import config from '../config';
import dependencyLoader from './dependencyLoader';
import expressLoader from './expressLoader';
import { wLoggerInstance as logger } from './logger';
import mongooseLoader from './mongooseLoader';

export default async (expressApp: express.Application) => {
  const _mongoConnection = await mongooseLoader();
  logger.info('MongoDB loaded ✌️');

  await dependencyLoader({
    schemas: config.dependencies.schemas,
    repositories: config.dependencies.repositories,
    services: config.dependencies.services,
  });

  logger.info('Dependencies loaded ✌️');

  await expressLoader(expressApp);
  logger.info('Express loaded ✌️');
};

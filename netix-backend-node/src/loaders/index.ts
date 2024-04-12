import express from 'express';
import dependencyLoader from './dependencyLoader';
import expressLoader from './expressLoader';
import { wLoggerInstance as logger } from './logger';

export default async (expressApp: express.Application) => {
  await dependencyLoader({
    schemas: [],
    controllers: [],
    repositories: [],
    services: [],
  });
  logger.info('Dependencies loaded ✌️');

  await expressLoader(expressApp);
  logger.info('Express loaded ✌️');
};

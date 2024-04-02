import express from 'express';
import expressLoader from './expressLoader';
import { wLoggerInstance as logger } from './logger';

export default async (expressApp: express.Application) => {
  await expressLoader(expressApp);
  logger.info('Express loaded ✌️');
};

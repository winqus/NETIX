import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { morganMiddleware, wLoggerInstance } from './loaders/logger';

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const port = process.env.PORT || 3055;
const logger = wLoggerInstance;

app.use(morganMiddleware);

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/logger', (_req: Request, res: Response) => {
  logger.error('This is an error log');
  logger.warn('This is a warn log');
  logger.info('This is a info log');
  logger.http('This is a http log');
  logger.debug('This is a debug log');

  res.send('Check the logs');
});

app.listen(port, () => {
  logger.debug(`[server]: Server is running at http://localhost:${port}`);
});

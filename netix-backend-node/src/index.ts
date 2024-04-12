import express, { Request, Response } from 'express';
import 'reflect-metadata';
import config from './config';
import loaders from './loaders';
import { wLoggerInstance as logger } from './loaders/logger';

(async () => {
  const app = express();

  await loaders(app);

  app.get('/', (_req: Request, res: Response) => {
    res.send('NETIX API is running!');
  });

  app.listen(config.port, () => {
    logger.info(`Server is running at http://localhost:${config.port} in ${config.environment} mode.`);
  });
})();

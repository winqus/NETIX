import bodyParser from 'body-parser';
import { Joi, Segments, celebrate } from 'celebrate';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import config from '../config';
import celebrateErrorHandler from './api/middlewares/celebrateErrorHandler';
import routes from './api/routes';
import { morganMiddleware, wLoggerInstance } from './loaders/logger';
import ErrorResponse from './models/errorResponse.model';

const app = express();
const logger = wLoggerInstance;

app.get('/status', (_, res) => {
  res.status(200).end();
});

app.head('/status', (_, res) => {
  res.status(200).end();
});

// app.enable('trust proxy');

app.use(cors());

app.use(morganMiddleware);

app.use(bodyParser.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post(
  '/test',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      message: Joi.string().required(),
    }),
  }),
  (req: Request, res: Response) => {
    const { message } = req.body;
    res.send({ message });
  }
);

app.get('/logger', (_req: Request, res: Response) => {
  logger.error('This is an error log');
  logger.warn('This is a warn log');
  logger.info('This is a info log');
  logger.http('This is a http log');
  logger.debug('This is a debug log');

  res.send('Check the logs');
});

app.use(config.api.prefix, routes());

app.use(celebrateErrorHandler);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`[server]: Unexpected error: ${err.message}`);

  res.status(err.status || 500);
  const response: ErrorResponse = { message: err.message || 'Unexpected error has occured.' };
  res.json(response);
});

app.listen(config.port, () => {
  logger.debug(`[server]: Server is running at http://localhost:${config.port} in ${config.environment} mode.`);
});

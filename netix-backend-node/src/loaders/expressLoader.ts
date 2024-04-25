import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import celebrateErrorHandler from '../api/middlewares/celebrateErrorHandler';
import multerErrorHandler from '../api/middlewares/multerErrorHandler';
import routes from '../api/routes';
import config from '../config';
import ErrorResponse from '../models/errorResponse.model';
import { wLoggerInstance as logger, morganMiddleware } from './logger';

export default (app: express.Application) => {
  app.get('/status', (_, res) => {
    res.status(200).end();
  });

  app.head('/status', (_, res) => {
    res.status(200).end();
  });

  // Enable if behind a reverse proxy (Heroku, Nginx, other)
  // app.enable('trust proxy');

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Middleware that logs http requests
  app.use(morganMiddleware);

  // Transforms raw string of req.body into javascript object
  app.use(bodyParser.json());

  // Load API routes
  app.use(config.api.prefix, routes());

  // Catch other not matched routes (404)
  app.use((_req: Request, res: Response, _next: NextFunction) => {
    logger.error(`[server]: Not Found`);
    res.status(404);
    const response: ErrorResponse = { message: 'Not Found' };
    res.json(response);
  });

  /*
   * Error handlers
   */

  app.use(celebrateErrorHandler);

  app.use(multerErrorHandler);

  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(`[server]: Unexpected error: ${error.message}`);

    res.status(error.status || 500);
    const response: ErrorResponse = { message: error.message || 'Unexpected error has occured.' };
    res.json(response);
  });
};

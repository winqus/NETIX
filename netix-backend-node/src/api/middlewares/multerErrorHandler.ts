import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { wLoggerInstance } from '../../loaders/logger';

export class CustomMulterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomMulterError';
  }
}

export default function multerErrorHandler(error: any, _: Request, res: Response, next: NextFunction) {
  if (error instanceof multer.MulterError) {
    wLoggerInstance.error(`[uploadVideoChunkMiddleware]: ${JSON.stringify(error)}`);

    return res.status(400).send(`Upload failed due to an error.`);
  } else if (error instanceof CustomMulterError) {
    wLoggerInstance.error(`[multerErrorHandler]: ${error.message}`);

    res.status(400).json({ message: error.message });
  } else {
    next(error);
  }
}

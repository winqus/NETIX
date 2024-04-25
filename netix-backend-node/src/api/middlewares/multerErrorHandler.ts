import { NextFunction, Request, Response } from 'express';
import { wLoggerInstance } from '../../loaders/logger';

export class CustomMulterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomMulterError';
  }
}

export default function multerErrorHandler(error: any, _: Request, res: Response, next: NextFunction) {
  if (error instanceof CustomMulterError) {
    wLoggerInstance.error(`[multerErrorHandler]: ${error.message}`);
    res.status(400).json({ message: error.message });
  } else {
    next(error);
  }
}

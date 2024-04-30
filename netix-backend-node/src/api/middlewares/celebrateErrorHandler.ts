import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'joi';
import { wLoggerInstance } from '../../loaders/logger';
import ErrorResponse from '../../models/errorResponse.model';

export default function celebrateErrorHandler(error: ValidationError, _: Request, res: Response, next: NextFunction) {
  if (isCelebrateError(error) && error.details) {
    const validationErrors: string[] = [];
    error.details.forEach((error) => {
      if (error.message) {
        validationErrors.push(error.message);
      }
    });

    const response: ErrorResponse = { message: error.message || 'validation errors', errors: validationErrors };

    wLoggerInstance.error(`[celebrateErrorHandler]: ${JSON.stringify(response)}`);

    res.status(400).json(response);
  } else {
    next(error);
  }
}

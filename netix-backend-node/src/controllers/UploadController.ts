import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NAMES } from '../config/dependencies';
import IUploadService from '../services/IServices/IUploadService';

@Service()
export default class UploadController {
  constructor(
    @Inject(NAMES.LOGGER) private logger: Logger,
    @Inject(NAMES.SERVICES.Upload) private uploadService: IUploadService
  ) {}

  public async getConstraints(_req: Request, res: Response, next: NextFunction) {
    try {
      const constraintsResult = await this.uploadService.getUploadConstraints();

      if (constraintsResult.isFailure) {
        return res.status(400).json({ error: constraintsResult.errorValue() });
      }

      const response = constraintsResult.getValue();
      this.logger.info(`[UploadVideoController, getConstraints]: Returning constraints for uploading video`);

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[UploadVideoController, getConstraints]: ${error}`);

      return next(error);
    }
  }
}

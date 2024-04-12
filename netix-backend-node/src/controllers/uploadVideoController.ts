import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import VideoService from '../services/videoService';

@Service()
export default class UploadVideoController {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject() private videoService: VideoService
  ) {}
  public async getConstraints(_req: Request, res: Response, next: NextFunction) {
    try {
      const constraintsResult = await this.videoService.getVideoUploadConstraints();

      if (constraintsResult.isFailure) {
        return res.status(500).json({ error: constraintsResult.errorValue() });
      }

      const response = constraintsResult.getValue();

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[UploadVideoController]: ${error}`);

      return next(error);
    }
  }
}

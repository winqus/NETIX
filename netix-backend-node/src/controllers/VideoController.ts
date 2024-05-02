import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NAMES } from '../config/dependencies';
import { IVideoService } from '../services/VideoService';

@Service()
export default class VideoController {
  constructor(
    @Inject(NAMES.Logger) private logger: Logger,
    @Inject(NAMES.SERVICES.Video) private videoService: IVideoService
  ) {}

  public async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || '0');
      const limit = parseInt((req.query.limit as string) || '10');

      const videosResult = await this.videoService.getVideosAtPageAndLimit(page, limit);

      if (videosResult.isFailure) {
        return res.status(400).json({ error: videosResult.errorValue() });
      }

      const response = videosResult.getValue();
      this.logger.info(`[VideoController, getVideos]: Returning constraints for uploading video`);

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[VideoController, getVideos]: ${JSON.stringify(error)}`);

      return next(error);
    }
  }

  public async getVideoByID(req: Request, res: Response, next: NextFunction) {
    try {
      const uploadID = req.params.uploadID;

      const videoResult = await this.videoService.getVideoByUploadID(uploadID);

      if (videoResult.isFailure) {
        return res.status(400).json({ error: videoResult.errorValue() });
      }

      const response = videoResult.getValue();
      this.logger.info(`[VideoController, getVideoByID]: Returning video by upload ID`);

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[VideoController, getVideoByID]: ${JSON.stringify(error)}`);

      return next(error);
    }
  }
}

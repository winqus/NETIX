import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { VideoChunkUploadDTO, VideoChunkUploadResponseDTO } from '../dto/videoUploadDTOs';
import IVideoUploadRequestService from '../services/IServices/IVideoUploadRequestService';
import IVideoUploadService from '../services/IServices/IVideoUploadService';

@Service()
export default class UploadVideoController {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('VideoUploadService') private videoUploadService: IVideoUploadService,
    @Inject('VideoUploadRequestService') private uploadRequestService: IVideoUploadRequestService
  ) {}

  public async getConstraints(_req: Request, res: Response, next: NextFunction) {
    try {
      const constraintsResult = await this.videoUploadService.getVideoUploadConstraints();

      if (constraintsResult.isFailure) {
        return res.status(400).json({ error: constraintsResult.errorValue() });
      }

      const response = constraintsResult.getValue();

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[UploadVideoController]: ${error}`);

      return next(error);
    }
  }

  public async uploadVideoChunk(req: Request, res: Response, next: NextFunction) {
    try {
      const uploadRequestId = req.params.requestId;
      const chunkIndex = parseInt(req.params.chunkIndex);
      const chunkData = req.file?.buffer;

      if (!uploadRequestId || chunkIndex === undefined || !chunkData) {
        this.logger.error(
          `[UploadVideoController]: Invalid request, missing data. uploadRequestId=${uploadRequestId}, 
          chunkIndex=${chunkIndex}, 
          chunkData.length=${chunkData?.length}`
        );

        if (!chunkData) {
          return res.status(400).json({ error: 'Invalid request, missing chunk data.' });
        }

        return res.status(400).json({ error: 'Invalid request, missing data.' });
      }

      const uploadRequestResult = await this.uploadRequestService.getVideoUploadRequest(uploadRequestId);

      if (chunkIndex < 0 || chunkIndex >= uploadRequestResult.getValue().totalChunks) {
        this.logger.error(`[UploadVideoController]: Invalid chunk index (${chunkIndex}) for request (${uploadRequestId})`);

        return res.status(400).json({ error: 'Invalid chunk index.' });
      }

      if (uploadRequestResult.isFailure) {
        this.logger.error(`[UploadVideoController]: Upload Request (${uploadRequestId}) failed: ${uploadRequestResult.errorValue()}`);

        return res.status(400).json({ error: uploadRequestResult.errorValue() });
      }

      const uploadRequest = uploadRequestResult.getValue();

      const chunkUploadDTO: VideoChunkUploadDTO = {
        requestId: uploadRequest.requestId,
        videoId: uploadRequest.videoId,
        chunkIndex,
        chunkData,
      };

      const uploadResult = await this.videoUploadService.saveVideoChunkFile(chunkUploadDTO);

      if (uploadResult.isFailure) {
        const response: VideoChunkUploadResponseDTO = {
          success: false,
          requestId: uploadRequest.requestId,
          chunkIndex,
          uploadComplete: false,
          code: 'UPLOAD_FAILED',
          message: uploadResult.errorValue()!,
        };

        this.logger.error(`[UploadVideoController]: Upload Request (${uploadRequestId}) failed: ${uploadResult.errorValue()}`);

        return res.status(400).json(response);
      }

      const response: VideoChunkUploadResponseDTO = {
        success: true,
        requestId: uploadRequest.requestId,
        chunkIndex,
        uploadComplete: false,
        code: 'UPLOAD_SUCCESS',
      };

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[UploadVideoController]: ${error}`);

      return next(error);
    }
  }
}

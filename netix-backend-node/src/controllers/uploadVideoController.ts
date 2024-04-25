import { NextFunction, Request, Response } from 'express';
import { parse } from 'path';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NewVideoUploadRequestDTO, NewVideoUploadRequestResponseDTO, VideoChunkUploadDTO, VideoChunkUploadResponseDTO } from '../dto/videoUploadDTOs';
import ErrorResponse from '../models/errorResponse.model';
import UploadRequestService from '../services/uploadRequestService';
import VideoService from '../services/videoService';

@Service()
export default class UploadVideoController {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject() private videoService: VideoService,
    @Inject() private uploadRequestService: UploadRequestService
  ) {}

  public async getConstraints(_req: Request, res: Response, next: NextFunction) {
    try {
      const constraintsResult = await this.videoService.getVideoUploadConstraints();

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

  public async requestUploadPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const fileName = req.body.fileName;
      const fileSizeInBytes = parseInt(req.body.fileSizeInBytes);
      const mimeType = req.body.mimeType;
      const durationInSeconds = parseInt(req.body.durationInSeconds);

      if (!fileName || !fileSizeInBytes || !mimeType || !durationInSeconds) {
        this.logger.error(
          `[UploadVideoController]: Invalid request, missing data. fileName=${fileName}, 
          fileSizeInBytes=${fileSizeInBytes}, mimeType=${mimeType}, 
          durationInSeconds=${durationInSeconds}`
        );

        return res.status(400).json({ error: 'Invalid request, missing data.' });
      }

      const newUploadRequestDTO: NewVideoUploadRequestDTO = {
        fileName,
        fileSizeInBytes,
        mimeType,
        durationInSeconds,
        userId: 'temp-user-id-123',
      };

      const uploadRequestResult = await this.uploadRequestService.createVideoUploadRequest(newUploadRequestDTO);
      if (uploadRequestResult.isFailure) {
        this.logger.error(`[UploadVideoController]: Upload Request failed: ${uploadRequestResult.errorValue()}`);
        const response: ErrorResponse = {
          message: 'Upload Request creation failed.',
          errors: [uploadRequestResult.errorValue() as string],
        };

        return res.status(400).json(response);
      }

      const response: NewVideoUploadRequestResponseDTO = {
        requestId: uploadRequestResult.getValue().requestId,
        videoId: uploadRequestResult.getValue().videoId,
        uploadUrl: 'temp-upload-url',
        totalChunksCount: 1,
        allowedUploadRateInChunksAtOnce: 1,
        chunkBaseName: 'temp-chunk-base-name',
      };

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

      const uploadResult = await this.videoService.saveVideoChunkFile(chunkUploadDTO);

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

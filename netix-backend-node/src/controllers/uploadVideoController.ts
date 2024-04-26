import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { VideoUploadState } from '../core/states/VideoUploadRequest.state';
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
      // TODO: Implement user authentication
      const userId = 'temp-user-id-123';

      // Helper function to create error response object
      const makeErrorResponse = (message?: string): VideoChunkUploadResponseDTO => ({
        success: false,
        requestId: uploadRequestId,
        chunkIndex: chunkIndex,
        uploadComplete: false,
        code: 'CHUNK_UPLOAD_FAILED',
        message: message || undefined,
      });

      if (!uploadRequestId || chunkIndex === undefined || !chunkData) {
        this.logger.error(
          `[UploadVideoController, uploadVideoChunk]: Invalid request, missing data. uploadRequestId=${uploadRequestId}, 
          chunkIndex=${chunkIndex}, 
          chunkData.length=${chunkData?.length}`
        );

        if (!chunkData) {
          return res.status(400).json(makeErrorResponse('Invalid request, missing chunk data.'));
        }

        return res.status(400).json(makeErrorResponse('Invalid request, missing data.'));
      }

      const uploadRequestResult = await this.uploadRequestService.getVideoUploadRequest(uploadRequestId);
      if (uploadRequestResult.isFailure) {
        this.logger.error(
          `[UploadVideoController, uploadVideoChunk]: Upload Request (${uploadRequestId}) failed: ${uploadRequestResult.errorValue()}`
        );

        return res.status(400).json(makeErrorResponse(uploadRequestResult.errorValue() as string));
      }

      const uploadRequest = uploadRequestResult.getValue();

      if (uploadRequest.requesterId !== userId) {
        this.logger.error(
          `[UploadVideoController, uploadVideoChunk]: Unauthorized user (${userId}) for request (${uploadRequestId}) ` +
            `that was made by user (${uploadRequest.requesterId})`
        );

        return res.status(401).json(makeErrorResponse('Unauthorized user.'));
      }

      if (chunkIndex < 0 || chunkIndex >= uploadRequest.totalChunks) {
        this.logger.error(`[UploadVideoController, uploadVideoChunk]: Invalid chunk index (${chunkIndex}) for request (${uploadRequestId})`);

        return res.status(400).json({ error: 'Invalid chunk index.' });
      }

      const chunkUploadDTO: VideoChunkUploadDTO = {
        requestId: uploadRequest.requestId,
        videoId: uploadRequest.videoId,
        chunkIndex,
        chunkData,
      };

      const uploadResult = await this.videoUploadService.saveVideoChunkFile(chunkUploadDTO);

      if (uploadResult.isFailure) {
        this.logger.error(`[UploadVideoController, uploadVideoChunk]: Upload Request (${uploadRequestId}) failed: ${uploadResult.errorValue()}`);

        return res.status(400).json(makeErrorResponse(uploadResult.errorValue() as string));
      }

      const incrementResult = await this.uploadRequestService.incrementUploadProgress(uploadRequestId, chunkIndex);
      if (incrementResult.isFailure) {
        this.logger.error(
          `[UploadVideoController, uploadVideoChunk]: ` +
            `Failed to increment upload progress for request (${uploadRequestId}), chunk (${chunkIndex}), error: ${incrementResult.errorValue()}`
        );

        return res.status(400).json(makeErrorResponse(incrementResult.errorValue() as string));
      }

      const response: VideoChunkUploadResponseDTO = {
        success: true,
        requestId: uploadRequest.requestId,
        chunkIndex: chunkIndex,
        uploadComplete: incrementResult.getValue().videoState === VideoUploadState.Completed,
        code: 'CHUNK_UPLOAD_SUCCESS',
      };

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[UploadVideoController, uploadVideoChunk]: ${error}`);

      return next(error);
    }
  }
}

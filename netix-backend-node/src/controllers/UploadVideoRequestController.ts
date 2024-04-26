import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NewVideoUploadRequestDTO, NewVideoUploadRequestResponseDTO } from '../dto/videoUploadDTOs';
import ErrorResponse from '../models/errorResponse.model';
import IVideoUploadRequestService from '../services/IServices/IVideoUploadRequestService';

@Service()
export default class UploadVideoRequestController {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('VideoUploadRequestService') private uploadRequestService: IVideoUploadRequestService
  ) {}

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
}

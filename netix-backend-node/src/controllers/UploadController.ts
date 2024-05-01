import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import HttpUploadRequest from '../api/IHttpRequest/HttpUploadRequest';
import { NAMES } from '../config/dependencies';
import { UploadMetadataRequestDTO, UploadMetadataResponseDTO } from '../dto/UploadMetadataDTO';
import IUploadService from '../services/IServices/IUploadService';
import IUploadVideoJobService from '../services/IServices/IUploadVideoJobService';

@Service()
export default class UploadController {
  constructor(
    @Inject(NAMES.Logger) private logger: Logger,
    @Inject(NAMES.SERVICES.Upload) private uploadService: IUploadService,
    @Inject(NAMES.SERVICES.UploadVideoJob) private uploadVideoJobService: IUploadVideoJobService
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
      this.logger.error(`[UploadVideoController, getConstraints]: ${JSON.stringify(error)}`);

      return next(error);
    }
  }

  public async getPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { fileName, fileSizeInBytes, mimeType, durationInSeconds } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User not found in request.' });
      }

      const permissionResult = await this.uploadService.getPermissionToUpload({
        userId,
        fileName,
        fileSizeInBytes,
        mimeType,
        durationInSeconds,
      });

      if (permissionResult.isFailure) {
        return res.status(400).json({ error: permissionResult.errorValue() });
      }

      const response = permissionResult.getValue();
      this.logger.info(`[UploadVideoController, getPermission]: Returning permission to upload video: ${JSON.stringify(response)}`);

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error(`[UploadVideoController, getPermission]: ${JSON.stringify(error)}`);

      return next(error);
    }
  }

  public async processChunk(req: HttpUploadRequest, res: Response, next: NextFunction) {
    try {
      this.checkUserAttached(req);
      this.checkUploadJobAttached(req);

      const uploadID = req.uploadJob!.upload.uuid;
      const chunkIndex = parseInt(req.params.chunkIndex, 10);

      const result = await this.uploadVideoJobService.updateChunkUploadProgress(uploadID, chunkIndex);

      if (result.isFailure) {
        this.logger.error(`[UploadVideoController, uploadChunk]: ${result.errorValue()}`);

        return res.status(400).json({ error: result.errorValue() });
      }

      return res.status(200).json({ message: 'Chunk upload progress updated.' });
    } catch (error) {
      this.logger.error(`[UploadVideoController, uploadChunk]: ${JSON.stringify(error)}`);

      return next(error);
    }
  }

  public async uploadMetadata(req: HttpUploadRequest, res: Response, next: NextFunction) {
    try {
      this.checkUserAttached(req);
      this.checkUploadJobAttached(req);

      const uploadID = req.uploadJob!.upload.uuid;
      const metadata = req.body as UploadMetadataRequestDTO;

      const updateResult = await this.uploadVideoJobService.uploadMetadata(uploadID, metadata);

      if (updateResult.isFailure) {
        this.logger.error(`[UploadVideoController, uploadMetadata]: ${updateResult.errorValue()}`);

        return res.status(400).json({ success: false, message: updateResult.errorValue() } as UploadMetadataResponseDTO);
      }

      const metadataDTO = updateResult.getValue();

      return res.status(200).json({ success: true, metadata: metadataDTO } as UploadMetadataResponseDTO);
    } catch (error) {
      this.logger.error(`[UploadVideoController, uploadMetadata]: ${error}`);

      return next(error);
    }
  }

  private checkUserAttached(req: Request) {
    if (!(req as any).user) {
      this.logger.error(`[UploadVideoController, uploadChunk]: User not found in request.`);

      throw new Error('User not found in request.');
    }
  }

  private checkUploadJobAttached(req: Request) {
    if (!(req as any).uploadJob) {
      this.logger.error(`[UploadVideoController, uploadChunk]: Upload job not found in request.`);

      throw new Error('Upload job not found in request.');
    }
  }
}

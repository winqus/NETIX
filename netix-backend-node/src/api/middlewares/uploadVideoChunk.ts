import { NextFunction } from 'express-serve-static-core';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import Container from 'typedi';
import { Logger } from 'winston';
import config from '../../config';
import { NAMES } from '../../config/dependencies';
import FullUploadVideoJobDTO from '../../dto/FullUploadVideoJobDTO';
import multerErrorHandler, { CustomMulterError } from './multerErrorHandler';

const videoChunkLocalStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const uploadID = req.params.uploadID;
    const dir = path.join(config.video.rawUploadDir, uploadID);

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, _file, cb) => {
    const uploadID = req.params.uploadID;
    const chunkIndex = parseInt(req.params.chunkIndex, 10);

    if (uploadID == null || chunkIndex == null) {
      (Container.get(NAMES.Logger) as Logger).error(`[uploadVideoChunkMiddleware]: Invalid upload ID (${uploadID}) or chunk index (${chunkIndex}).`);

      cb(new CustomMulterError('Invalid upload ID or chunk index.') as Error, `error_${Date.now()}`);
    }

    const fileName = uploadID + '_chunk-' + chunkIndex;
    cb(null, fileName);
  },
});

const videoChunkFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const job = (req as any).uploadJob as FullUploadVideoJobDTO;
  const chunkIndex = parseInt(req.params.chunkIndex, 10);

  if (!job) {
    (Container.get(NAMES.Logger) as Logger).error(`[uploadVideoChunkMiddleware]: No upload job attached to request.`);

    cb(new CustomMulterError('No upload job attached to request.') as Error);
  } else if (job.chunks[chunkIndex] == null || job.chunks[chunkIndex] === true) {
    (Container.get(NAMES.Logger) as Logger).error(`[uploadVideoChunkMiddleware]: Chunk (${chunkIndex}) already uploaded or invalid index. `);

    cb(new CustomMulterError('Chunk already uploaded.') as Error);
  } else {
    cb(null, true);
  }

  const allowedMimeTypes = [config.video.allowedMimeTypes, 'application/octet-stream'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    (Container.get(NAMES.Logger) as Logger).error(`[uploadVideoChunkMiddleware]: Invalid video mime type (${file.mimetype}).`);
    cb(new CustomMulterError('Invalid video mime type.'));
    cb(null, false);
  }
};

const videoChunkUploadLimits = {
  fileSize: config.video.singleChunkMaxSizeInBytes + 5 * 1024 * 1024, // 5MB for margin of error
};

const videoChunkUpload = multer({
  storage: videoChunkLocalStorage,
  fileFilter: videoChunkFilter,
  limits: videoChunkUploadLimits,
});

const uploadVideoChunkMiddleware = (req: any, res: any, next: NextFunction) => {
  const upload = videoChunkUpload.single('videoChunk');

  upload(req, res, (error) => {
    const logger = Container.get(NAMES.Logger) as Logger;

    if (error) {
      logger.error(`[uploadVideoChunkMiddleware]: Unexpected error: ${error.message}`);
    }

    if (!req.file) {
      logger.error(`[uploadVideoChunkMiddleware]: Chunk upload failed: No file provided.`);

      return res.status(400).json({ message: 'No file provided.' });
    }

    multerErrorHandler(error, req, res, next);
  });
};

export default uploadVideoChunkMiddleware;

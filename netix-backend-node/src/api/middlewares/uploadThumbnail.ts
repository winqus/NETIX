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

const thumbnailLocalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(config.video.thumbnail.rawUploadDir);

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, _file, cb) => {
    const uploadID = req.params.uploadID;

    if (uploadID == null) {
      (Container.get(NAMES.Logger) as Logger).error(`[uploadThumbnailMiddleware]: Invalid upload ID (${uploadID})`);

      cb(new CustomMulterError('Invalid upload ID') as Error, `error_${Date.now()}`);
    }

    const fileName = uploadID + '_thumbnail';
    cb(null, fileName);
  },
});

const thumbnailFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const job = (req as any).uploadJob as FullUploadVideoJobDTO;

  if (!job) {
    (Container.get(NAMES.Logger) as Logger).error(`[uploadThumbnailMiddleware]: No upload job attached to request.`);

    cb(new CustomMulterError('No upload job attached to request.') as Error);
  } else if (job.upload.thumbnail.ready === true) {
    (Container.get(NAMES.Logger) as Logger).error(`[uploadThumbnailMiddleware]: Thumbnail is present for upload (${job.upload.uuid}). `);

    cb(new CustomMulterError('Thumbnail already uploaded.') as Error);
  } else {
    cb(null, true);
  }

  const allowedMimeTypes = [...config.video.thumbnail.allowedMimeTypes, 'application/octet-stream'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    (Container.get(NAMES.Logger) as Logger).error(`[uploadThumbnailMiddleware]: Invalid file mime type (${file.mimetype}).`);
    cb(new CustomMulterError('Invalid file mime type.'));
    cb(null, false);
  }
};

const thumbnailUploadLimits = {
  fileSize: config.video.thumbnail.maxSizeBytes,
};

const thumbnailUpload = multer({
  storage: thumbnailLocalStorage,
  fileFilter: thumbnailFilter,
  limits: thumbnailUploadLimits,
});

const uploadThumbnailMiddleware = (req: any, res: any, next: NextFunction) => {
  const upload = thumbnailUpload.single('thumbnail');

  upload(req, res, (error) => {
    const logger = Container.get(NAMES.Logger) as Logger;

    if (error instanceof CustomMulterError) {
      logger.error(`[uploadThumbnailMiddleware]: ${error.message}`);

      return res.status(400).json({ message: error.message });
    }

    if (!req.file) {
      logger.error(`[uploadThumbnailMiddleware]: File upload failed: No file provided.`);

      return res.status(400).json({ message: 'No file provided.' });
    }

    multerErrorHandler(error, req, res, next);
  });
};

export default uploadThumbnailMiddleware;

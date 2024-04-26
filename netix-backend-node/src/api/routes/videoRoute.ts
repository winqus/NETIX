import { Joi, celebrate } from 'celebrate';
import { Router } from 'express';
import multer from 'multer';
import Container from 'typedi';
import config from '../../config';
import UploadVideoController from '../../controllers/UploadVideoController';
import UploadVideoRequestController from '../../controllers/UploadVideoRequestController';
// import { CustomMulterError } from '../middlewares/multerErrorHandler';

const videoChunkStorage = multer.memoryStorage();

// const videoChunkFilter = (_req: any, file: Express.Multer.File, cb: any) => {
//   const allowedMimeTypes = config.video.allowedMimeTypes;
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new CustomMulterError('Invalid video mime type.'));
//     cb(null, false);
//   }
// };

const videoChunkUploadLimits = {
  fileSize: config.video.singleChunkMaxSizeInBytes,
};

const videoChunkUpload = multer({
  storage: videoChunkStorage,
  // fileFilter: videoChunkFilter,
  limits: videoChunkUploadLimits,
});

const videoChunkUploadRequestSchema = {
  params: {
    requestId: Joi.string().required(),
    chunkIndex: Joi.number().required(),
  },
};

const newVideoUploadRequestSchema = {
  body: Joi.object({
    fileName: Joi.string().required(),
    fileSizeInBytes: Joi.number().required(),
    mimeType: Joi.string().required(),
    durationInSeconds: Joi.number().required(),
  }),
};

export default (router: Router) => {
  router.use('/v1/videos', router);

  const uploadController = Container.get(UploadVideoController);
  const requestController = Container.get(UploadVideoRequestController);

  router.get('/constraints', (req, res, next) => uploadController.getConstraints(req, res, next));

  router.post('/upload/permission', celebrate(newVideoUploadRequestSchema), (req, res, next) =>
    requestController.requestUploadPermission(req, res, next)
  );

  router.post('/upload/:requestId/:chunkIndex', celebrate(videoChunkUploadRequestSchema), videoChunkUpload.single('videoChunk'), (req, res, next) =>
    uploadController.uploadVideoChunk(req, res, next)
  );
};

import { Joi, celebrate } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import UploadController from '../../controllers/UploadController';
import attachUploadVideoJobInProgress from '../middlewares/attachUploadVideoJobInProgress';
import attachUser from '../middlewares/fakeAttachUser';
import authenticate from '../middlewares/fakeAuthenticate';
import uploadVideoChunk from '../middlewares/uploadVideoChunk';
import { permissionRequestSchema, videoChunkUploadRequestSchema } from './requestDataValidators/uploadValidators';

export default (router: Router) => {
  router.use('/v1/upload', router);

  const uploadController = Container.get(UploadController);

  router.get('/constraints', authenticate, (req, res, next) => uploadController.getConstraints(req, res, next));

  router.post('/permission', celebrate(permissionRequestSchema), authenticate, attachUser, (req, res, next) =>
    uploadController.getPermission(req, res, next)
  );

  router.post(
    '/:uploadID/videoChunk/:chunkIndex',
    celebrate(videoChunkUploadRequestSchema),
    authenticate,
    attachUser,
    attachUploadVideoJobInProgress,
    uploadVideoChunk,
    (req, res, next) => uploadController.processChunk(req, res, next)
  );
};

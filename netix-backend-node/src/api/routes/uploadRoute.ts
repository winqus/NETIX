import { Joi, celebrate } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import UploadController from '../../controllers/UploadController';
import attachUser from '../middlewares/fakeAttachUser';
import authenticate from '../middlewares/fakeAuthenticate';

const permissionSchema = {
  body: Joi.object({
    fileName: Joi.string().required().max(200),
    fileSizeInBytes: Joi.number().integer().min(0).required(),
    mimeType: Joi.string().required().max(30),
    durationInSeconds: Joi.number().integer().min(0).required(),
  }),
};

export default (router: Router) => {
  router.use('/v1/upload', router);

  const uploadController = Container.get(UploadController);

  router.get('/constraints', authenticate, (req, res, next) => uploadController.getConstraints(req, res, next));

  router.post('/permission', celebrate(permissionSchema), authenticate, attachUser, (req, res, next) =>
    uploadController.getPermission(req, res, next)
  );
};

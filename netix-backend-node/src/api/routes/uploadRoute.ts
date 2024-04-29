import { Router } from 'express';
import Container from 'typedi';
import UploadController from '../../controllers/UploadController';
import authenticate from '../middlewares/fakeAuthenticate';

export default (router: Router) => {
  router.use('/v1/upload', router);

  const uploadController = Container.get(UploadController);

  router.get('/constraints', authenticate, (req, res, next) => uploadController.getConstraints(req, res, next));
};

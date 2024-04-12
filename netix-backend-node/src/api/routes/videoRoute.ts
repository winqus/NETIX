import { Router } from 'express';
import Container from 'typedi';
import UploadVideoController from '../../controllers/uploadVideoController';

export default (router: Router) => {
  router.use('/v1/videos', router);

  const controller = Container.get(UploadVideoController);

  router.get('/constraints', (req, res, next) => controller.getConstraints(req, res, next));
};

import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import VideoController from '../../controllers/VideoController';
import authenticate from '../middlewares/validateAccessToken';

export default (router: Router) => {
  const videoController = Container.get(VideoController);

  router.get(
    '/v1/videos',
    celebrate({
      query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(20),
      }),
    }),
    authenticate,
    (req, res, next) => videoController.getVideos(req, res, next)
  );

  router.get(
    '/v1/videos/:uploadID',
    celebrate({
      params: Joi.object({
        uploadID: Joi.string().uuid().required(),
      }),
    }),
    authenticate,
    (req, res, next) => videoController.getVideoByID(req, res, next)
  );
};

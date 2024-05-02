import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import path from 'node:path';
import { wLoggerInstance } from '../../loaders/logger';

export default (router: Router) => {
  router.get(
    '/v1/stream/:uuid/',
    celebrate({
      params: Joi.object({
        uuid: Joi.string().uuid().required(),
      }),
    }),
    (req, res) => {
      wLoggerInstance.info(`Sending video stream with id ${req.params.uuid}`);

      const videoPath = path.resolve(`data/uploads/processedVideos/${req.params.uuid}/output.m3u8`);
      res.type('application/x-mpegURL');
      res.sendFile(videoPath);
    }
  );

  router.get(
    '/v1/stream/:uuid/:segment',
    celebrate({
      params: Joi.object({
        uuid: Joi.string().uuid().required(),
        segment: Joi.string().required(),
      }),
    }),
    (req, res) => {
      wLoggerInstance.info(
        `Sending video segment ${req.params.segment} of stream with id ${req.params.uuid}`
      );

      const videoPath = path.resolve(
        `data/uploads/processedVideos/${req.params.uuid}/${req.params.segment}`
      );
      res.type('application/x-mpegURL');
      res.sendFile(videoPath);
    }
  );
};

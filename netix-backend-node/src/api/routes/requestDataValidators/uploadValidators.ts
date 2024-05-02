import { Joi } from 'celebrate';
import config from '../../../config';

export const permissionRequestSchema = {
  body: Joi.object({
    fileName: Joi.string().required().max(200),
    fileSizeInBytes: Joi.number().integer().min(0).required(),
    mimeType: Joi.string().required().max(30),
    durationInSeconds: Joi.number().integer().min(0).required(),
  }),
};

export const videoChunkUploadRequestSchema = {
  params: {
    uploadID: Joi.string().required(),
    chunkIndex: Joi.number().integer().min(0).required(),
  },
};

export const metadataUploadRequestSchema = {
  params: {
    uploadID: Joi.string().required(),
  },
  body: Joi.object({
    metadata: {
      title: Joi.string().required().min(config.video.titleLength.min).max(config.video.titleLength.max),
      publishDatetime: Joi.date().required(),
    },
  }),
};

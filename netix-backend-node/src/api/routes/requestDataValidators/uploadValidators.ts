import { Joi } from 'celebrate';

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

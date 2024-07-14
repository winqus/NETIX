import { UnsupportedMediaTypeException } from '@nestjs/common/exceptions/unsupported-media-type.exception';

export default (allowedMimeTypes: string[]) => {
  return (_req: any, file: Express.Multer.File, callback: any) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(
        new UnsupportedMediaTypeException(`Only the following MIME types are allowed: ${allowedMimeTypes.join(', ')}`),
        false,
      );

      return;
    }

    callback(null, true);
  };
};

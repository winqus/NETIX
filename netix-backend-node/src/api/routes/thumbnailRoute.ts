import { Joi, celebrate } from 'celebrate';
import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import config from '../../config';
import { wLoggerInstance } from '../../loaders/logger';
// import authenticate from '../middlewares/validateAccessToken';

const fileCache: Record<string, { path: string; type: string }> = {};

export default (router: Router) => {
  router.get(
    '/v1/thumbnail/:uuid',
    // authenticate,
    celebrate({
      params: Joi.object({
        uuid: Joi.string().uuid().required(),
      }),
    }),
    (req, res) => {
      const { uuid } = req.params;
      const directoryPath = path.resolve(config.video.thumbnail.processedUploadDir);
      const extensions = ['.png', '.webp', '.jpg'];

      if (fileCache[uuid]) {
        const options = { headers: { 'Content-Type': fileCache[uuid].type } };

        return res.sendFile(fileCache[uuid].path, options, (err) => {
          if (err) {
            wLoggerInstance.error(`Failed to send file from cache: ${err}`);
            delete fileCache[uuid]; // Remove corrupt or missing cache entry
            res.status(500).send('Failed to retrieve thumbnail');
          }
        });
      }

      const sendFileIfExists = (index: number) => {
        if (index >= extensions.length) {
          return res.status(404).send('Thumbnail not found');
        }

        const filePath = path.join(directoryPath, `${uuid}${extensions[index]}`);

        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            wLoggerInstance.info(`File not found: ${filePath}`);
            sendFileIfExists(index + 1); // Try the next file extension
          } else {
            const contentType = getContentType(filePath);
            const options = { headers: { 'Content-Type': contentType } };
            fileCache[uuid] = { path: filePath, type: contentType }; // Cache the found file path
            res.sendFile(filePath, options, (err) => {
              if (err) {
                wLoggerInstance.error(`Failed to send file: ${err}`);
                delete fileCache[uuid]; // In case of any error, clear the cache entry

                res.status(500).send('Failed to retrieve thumbnail');
              }
            });
          }
        });
      };

      sendFileIfExists(0); // Start trying with the first file extension
    }
  );
};

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case '.png':
      return 'image/png';
    case '.jpeg':
    case '.jpg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream'; // Default content type if none matches
  }
}

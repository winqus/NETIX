import { Joi, celebrate } from 'celebrate';
import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import config from '../../config';
import fakeAuthenticate from '../middlewares/fakeAuthenticate';

const fileCache: any = {};

export default (router: Router) => {
  router.get(
    '/v1/thumbnail/:uuid',
    fakeAuthenticate,
    celebrate({
      params: Joi.object({
        uuid: Joi.string().uuid().required(),
      }),
    }),
    (req, res) => {
      const { uuid } = req.params;
      const directoryPath = path.resolve(config.video.thumbnail.processedUploadDir);
      const extensions = ['.png', '.webp', '.jpeg'];

      if (fileCache[uuid]) {
        return res.sendFile(fileCache[uuid], (err) => {
          if (err) {
            console.error('Failed to send file from cache:', err);
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
            console.log(`File not found: ${filePath}`);
            sendFileIfExists(index + 1); // Try the next file extension
          } else {
            fileCache[uuid] = filePath; // Cache the found file path
            res.sendFile(filePath, (err) => {
              if (err) {
                console.error('Failed to send file:', err);
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

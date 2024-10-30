import * as fse from 'fs-extra';
import * as path from 'path';
import * as tus from 'tus-js-client';

export function uploadFileWithTUS(endpoint: string, filePath: string, fileType: string): Promise<'uploaded'> {
  const file = fse.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: endpoint,
      metadata: {
        filename: path.basename(filePath),
        filetype: fileType,
      },
      onError(error) {
        reject(error);
      },
      onSuccess(_payload) {
        resolve('uploaded');
      },
    });
    upload.start();
  });
}

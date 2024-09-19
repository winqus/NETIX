/* 
  Installs redis binary v5.0.14.1 for use with in-memory-server if its Windows.
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
const unzipper = require('unzipper');

const redisBinaryUrl = 'https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip';
const cacheDir = path.resolve('node_modules/.cache/redis-binaries/win-x64-5.0.14.1');
const zipPath = path.join(cacheDir, 'redis.zip');
const targetBinaryFilename = 'redis-server.exe';

(async () => {
  if (process.platform !== 'win32') {
    return;
  }

  if (fs.existsSync(path.join(cacheDir, targetBinaryFilename))) {
    return;
  }

  console.log('Installing Redis server binary for in-memory-server...');

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  console.log(`Downloading Redis server binary from ${redisBinaryUrl} ...`);

  try {
    await downloadFile(redisBinaryUrl, zipPath);

    try {
      await extractFromZipToFile(zipPath, targetBinaryFilename, cacheDir);
    } catch (error) {
      console.error('Error extracting Redis binary:', error);
    } finally {
      fs.unlink(zipPath, (err) => {
        if (err) {
          console.error('Error deleting ZIP file:', err);
        }
      });
    }
  } catch (error) {
    console.error('Error downloading Redis binary:', error);
  }

  console.log('Redis binary installation completed. Finalizing and exiting...');
})();

async function downloadFile(redisBinaryUrl, zipPath) {
  return new Promise((resolve, reject) => {
    const makeRequest = (currentUrl) => {
      https
        .get(currentUrl, (response) => {
          // Check for redirect status codes & recursively handle redirects
          if ([301, 302, 307, 308].includes(response.statusCode)) {
            const redirectUrl = response.headers.location;
            makeRequest(redirectUrl);

            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Request Failed. Status Code: ${response.statusCode}`));

            return;
          }

          response
            .pipe(fs.createWriteStream(zipPath))
            .on('finish', () => {
              resolve();
            })
            .on('error', (err) => {
              console.error('Error writing Redis binary:', err);
              reject(err);
            });
        })
        .on('error', (err) => {
          console.error('Request error:', err);
          reject(err);
        });
    };

    makeRequest(redisBinaryUrl);
  });
}

async function extractFromZipToFile(zipPath, targetBinaryFilename, outputDir) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        const entryFileName = path.basename(entry.path);
        const entryType = entry.type;

        if (entryFileName === targetBinaryFilename && entryType === 'File') {
          const outputFilePath = path.join(outputDir, targetBinaryFilename);

          entry
            .pipe(fs.createWriteStream(outputFilePath))
            .on('finish', () => {
              resolve();
            })
            .on('error', (err) => {
              console.error('Error writing extracted file:', err);
              reject(err);
            });
        } else {
          entry.autodrain();
        }
      })
      .on('error', (err) => {
        console.error('Error reading ZIP file:', err);
        reject(err);
      })
      .on('close', () => {
        resolve();
      });
  });
}

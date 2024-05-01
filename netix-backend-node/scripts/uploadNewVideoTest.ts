import fs from 'fs';
import path from 'path';

// Get upload permission
// http://[::1]:3055/api/v1/videos/upload/permission
const getPermission = async (file: File) => {
  const url = 'http://[::1]:3055/api/v1/upload/permission';

  const body = {
    fileName: file.name,
    fileSizeInBytes: file.size,
    mimeType: file.type || 'video/mp4',
    // mimeType: 'video/mp4',
    durationInSeconds: 900,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer some.fake-jwt.token',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return data;
};

// Split video into chunks
const splitVideoIntoChunks = async (file: File, permission: any) => {
  const chunkCount = permission.totalChunksCount;
  const fileSize = file.size;
  const chunks: Blob[] = [];

  const chunkSize = Math.ceil(fileSize / chunkCount);

  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(fileSize, (i + 1) * chunkSize);

    const chunk = file.slice(start, end);

    chunks.push(chunk);
  }

  return chunks;
};

// Upload chunks
const uploadChunks = async (chunks: Blob[], permission: any) => {
  const baseUrl = permission.uploadUrl;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const formData = new FormData();

    formData.append('videoChunk', chunk);
    // formData.append('videoChunk=video/mp4', chunk);

    const url = `${baseUrl}/${i}`;
    console.log('Uploading chunk', i, 'to', url);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: 'Bearer some.fake-jwt.token',
      },
    });

    console.log(response.status);
    const bodyData = await response.text();

    console.log(bodyData);
  }
};

const loadLocalFile = async (fileName = 'videoFile1.mkv'): Promise<File> => {
  if (!fileName) {
    throw new Error('File name is required');
  }

  const filePath = path.join(`${__dirname}/files`, fileName);
  const fileBuffer = fs.readFileSync(filePath);

  const file = new File([fileBuffer], fileName);

  return file;
};

(async () => {
  const file = await loadLocalFile('videoFile1.mkv');
  // const file = await loadLocalFile('image2.mp4');
  console.log(`File (${file.name}) loaded`, file);

  // const permission = await getPermission(file);
  const permission = {
    uploadId: 'f9c0f9a2-8452-485a-a10c-94f6ef8180a0',
    uploadUrl: 'http://localhost:3055/api/v1/upload/f9c0f9a2-8452-485a-a10c-94f6ef8180a0/videoChunk',
    // totalChunksCount: 1,
    totalChunksCount: 2,
    allowedUploadRateInChunksAtOnce: 1,
    chunkBaseName: 'a2398c2c-fd0a-432d-a077-5b790b787667',
  };
  console.log('Permission received', permission);

  const chunks = await splitVideoIntoChunks(file, permission);

  await uploadChunks(chunks, permission);
})();

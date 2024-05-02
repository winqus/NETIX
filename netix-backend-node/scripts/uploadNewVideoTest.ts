/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import path from 'path';

type PermissionResponseDTO = {
  uploadId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
};

const loadLocalFile = async (fileName: string): Promise<File> => {
  if (!fileName) {
    throw new Error('File name is required');
  }

  const filePath = path.join(`${__dirname}/files`, fileName);
  const fileBuffer = fs.readFileSync(filePath);

  const file = new File([fileBuffer], fileName);

  return file;
};

// Get upload permission
// http://[::1]:3055/api/v1/videos/upload/permission
const getPermission = async (file: File): Promise<PermissionResponseDTO> => {
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

  return data as PermissionResponseDTO;
};

const getExistingUserUpload = async (log = true) => {
  const url = 'http://[::1]:3055/api/v1/upload/user';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer some.fake-jwt.token',
    },
  });

  const data = await response.json();
  log && console.log(`${response.status} Existing user upload`, data);

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

const uploadMetadata = async (uploadId: string, metadata: { title: string; publishDatetime: Date }) => {
  const url = `http://[::1]:3055/api/v1/upload/${uploadId}/metadata`;

  const body = {
    metadata: metadata,
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer some.fake-jwt.token',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(response.status + ' Metadata uploaded', data);

  return data;
};

const uploadThumbnail = async (uploadId: string, fileName: string) => {
  const url = `http://[::1]:3055/api/v1/upload/${uploadId}/thumbnail`;

  const file = await loadLocalFile(fileName);

  const formData = new FormData();
  formData.append('thumbnail', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: 'Bearer some.fake-jwt.token',
    },
  });

  const data = await response.json();
  console.log(response.status + ' Thumbnail uploaded', data);

  return data;
};

(async () => {
  /*** Load video file ***/
  const file = await loadLocalFile('videofile1.mp4');
  // // const file = await loadLocalFile('image2.mp4');
  console.log(`File (${file.name}) loaded`, file);
  /*** Upload Request ***/
  //--------------------------------------------------------------------------------
  let permission: PermissionResponseDTO;
  // permission = await getPermission(file);
  permission = {
    uploadId: '70d168df-1ad4-4144-8a4a-da986b1986a3',
    uploadUrl: 'http://localhost:3055/api/v1/upload/70d168df-1ad4-4144-8a4a-da986b1986a3/videoChunk',
    totalChunksCount: 1,
    allowedUploadRateInChunksAtOnce: 1,
    chunkBaseName: 'd8a574d7-dc41-4b4a-bc71-1b6c4fa31ff9_chunk-',
  };
  console.log('Permission: ', permission);
  //--------------------------------------------------------------------------------
  /*** Upload video ***/
  const chunks = await splitVideoIntoChunks(file, permission);
  await uploadChunks(chunks, permission);
  //--------------------------------------------------------------------------------
  /*** Upload metadata ***/
  await uploadMetadata(permission.uploadId, {
    title: 'Amazing video title',
    publishDatetime: new Date('2021-09-05T00:00:00.000Z'),
  });
  //--------------------------------------------------------------------------------
  /*** Upload thumbnail ***/
  await uploadThumbnail(permission.uploadId, 'thumbnail1.png');
  // await getExistingUserUpload();
})();

import { environment } from '@ntx/environments/environment';

export const API_CONFIG = {
  baseUrl: environment.api.serverUrl + '/api',
  endpoints: {
    uploadConstraints: '/v1/upload/constraints',
    uploadPermission: '/v1/upload/permission',
    videos: '/v1/videos',
  },
};

export const SERVER = {
  baseUrl: environment.api.serverUrl + '/api',
  endpoints: {
    uploadMetadata: '/v1/movies',
  },
};

export function getUploadMovieMetadataUrl(): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.uploadMetadata}`;
}

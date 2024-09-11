import { environment } from '@ntx/environments/environment';

export const API_CONFIG = {
  baseUrl: environment.api.serverUrl + '/api',
  endpoints: {
    uploadConstraints: '/v1/upload/constraints',
    uploadPermission: '/v1/upload/permission',
    videos: '/v1/videos',
  },
};

export const METADATA_CONFIG = {
  baseUrl: environment.api.serverUrl + '/api',
  endpoints: {
    searchByTitle: '/v1/search/title',
    uploadThumbnail: '/v1/thumbnails/title',
    uploadVideo: '/v1/videos/title',
  },
};

export function getSearchByTitleUrl(title: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.searchByTitle}?q=${encodeURIComponent(title)}`;
}

export function getSearchByIdUrl(id: string, type: string, source: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.searchByTitle}/${encodeURIComponent(id)}?type=${encodeURIComponent(type)}&source=${encodeURIComponent(source)}`;
}

export function getUploadThumbnail(id: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.uploadThumbnail}/${encodeURIComponent(id)}`;
}

export function getUploadVideo(id: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.uploadVideo}/${encodeURIComponent(id)}`;
}

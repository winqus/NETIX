export const API_CONFIG = {
  baseUrl: 'http://[::1]:3055/api/v1',
  endpoints: {
    uploadConstraints: '/upload/constraints',
    uploadPermission: '/upload/permission',
    videos: '/videos',
  },
};

export const METADATA_CONFIG = {
  baseUrl: 'http://[::1]:3055/api',
  endpoints: {
    searchByTitle: '/v1/search/title',
  },
};

export function getSearchByTitleUrl(title: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.searchByTitle}?q=${encodeURIComponent(title)}`;
}

export function getSearchByIdUrl(id: string, type: string, source: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.searchByTitle}/${encodeURIComponent(id)}?type=${encodeURIComponent(type)}&source=${encodeURIComponent(source)}`;
}

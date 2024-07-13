export const METADATA_CONFIG = {
  baseUrl: 'http://[::1]:3055/v1',
  endpoints: {
    searchByTitle: '/search/title',
  },
};

export function getSearchByTitleUrl(title: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.searchByTitle}?q=${encodeURIComponent(title)}`;
}

export function getSearchByIdUrl(id: string, type: string, source: string): string {
  return `${METADATA_CONFIG.baseUrl}${METADATA_CONFIG.endpoints.searchByTitle}/${encodeURIComponent(id)}?type=${encodeURIComponent(type)}&source=${encodeURIComponent(source)}`;
}

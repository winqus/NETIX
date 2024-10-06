import { ur } from '@faker-js/faker/.';
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
    movies: '/v1/movies',
    poster: '/v1/poster',
    imageProxy: '/v1/images-proxy',
    library: {
      search: '/v1/library/search',
      externalMovies: '/v1/library/external-movies',
    },
  },
};

export function getMovieUrl(_id?: string): string {
  if (_id) {
    return `${SERVER.baseUrl}${SERVER.endpoints.movies}/${_id}`;
  } else {
    return `${SERVER.baseUrl}${SERVER.endpoints.movies}`;
  }
}

export function getPoster(_id: string, _size?: string) {
  if (_size) {
    return `${SERVER.baseUrl}${SERVER.endpoints.poster}/${_id}?size=${_size}`;
  } else {
    return `${SERVER.baseUrl}${SERVER.endpoints.poster}/${_id}`;
  }
}

export function getImageProxy(_url: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.imageProxy}?url=${_url}`;
}

export function getLibrarySearch(_query: string, _types: string, _providers: string, _limit?: number) {
  let url = `${SERVER.baseUrl}${SERVER.endpoints.library.search}?query=${_query}&types=${_types}&providers=${_providers}`;
  if (_limit !== undefined) url += `&limit=${_limit}`;

  return url;
}

export function getExternalMovie(_id: string, _providerId: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.library.externalMovies}/${_id}/metadata?providerID=${_providerId}`;
}

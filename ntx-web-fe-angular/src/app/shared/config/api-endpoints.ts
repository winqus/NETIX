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

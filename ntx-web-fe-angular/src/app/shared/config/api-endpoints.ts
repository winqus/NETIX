export const API_CONFIG = {
  baseUrl: '/api',
  endpoints: {
    uploadConstraints: '/v1/upload/constraints',
    uploadPermission: '/v1/upload/permission',
    videos: '/v1/videos',
  },
};

export const SERVER = {
  baseUrl: '/api',
  endpoints: {
    movies: {
      movies: '/v1/movies',
      moviesImport: '/v1/movies-import',
    },
    image: {
      poster: '/v1/poster',
      backdrops: '/v1/backdrops',
      imageProxy: '/v1/images-proxy',
    },
    library: {
      search: '/v1/library/search',
      externalMovies: '/v1/library/external-movies',
    },
    videos: {
      videos: '/v1/videos',
      videoRequirements: '/v1/video-requirements/file',
    },
  },
};

export function getMovieUrl(_id?: string): string {
  let url = `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}`;
  if (_id) url += `/${_id}`;

  return url;
}

export function getMoviePublishedUrl(_id: string): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}/${_id}/published`;
}

export function getMoviePosterUrl(_id: string): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}/${_id}/poster`;
}

export function getMovieBackdropUrl(_id: string): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}/${_id}/backdrop`;
}

export function getMovieImportUrl(): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.moviesImport}`;
}

export function getPoster(_id: string, _size?: string) {
  let url = `${SERVER.baseUrl}${SERVER.endpoints.image.poster}/${encodeURIComponent(_id)}`;
  if (_size) url += `?size=${encodeURIComponent(_size)}`;

  return url;
}

export function getBackdrop(_id: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.image.backdrops}/${_id}`;
}

export function replacePoster(_id: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}/${_id}/poster`;
}

export function getImageProxy(_url: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.image.imageProxy}?url=${encodeURIComponent(_url)}`;
}

export function getLibrarySearch(_query: string, _types: string, _providers: string, _limit?: number) {
  let url = `${SERVER.baseUrl}${SERVER.endpoints.library.search}?query=${encodeURIComponent(_query)}&types=${_types}&providers=${_providers}`;
  if (_limit !== undefined) url += `&limit=${_limit}`;

  return url;
}

export function getExternalMovie(_id: string, _providerId: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.library.externalMovies}/${_id}/metadata?providerID=${_providerId}`;
}

export function getVideoRequirementsUrl() {
  return `${SERVER.baseUrl}${SERVER.endpoints.videos.videoRequirements}`;
}

export function getVideoUpload(_id: string) {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}/${_id}/video`;
}

export function getVideo(_id?: string): string {
  let url = `${SERVER.baseUrl}${SERVER.endpoints.videos.videos}`;
  if (_id) url += `/${_id}`;

  return url;
}

export function getVideoStream(_id: string): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.videos.videos}/${_id}/stream`;
}

export function getAuditLogs(_id: string): string {
  return `${SERVER.baseUrl}${SERVER.endpoints.movies.movies}/${_id}/logs`;
}

import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateMovieDTO } from '../dto/create-movie.dto';
import { MovieDTO } from '../dto/movie.dto';

export function ApiDocsForPostMovie() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new movie with custom details' }),
    ApiConsumes('multipart/form-data'),
    ApiExtraModels(CreateMovieDTO),
    ApiBody({
      schema: {
        type: 'object',
        allOf: [
          { $ref: getSchemaPath(CreateMovieDTO) },
          { properties: { poster: { type: 'string', format: 'binary' } }, required: ['poster'] },
        ],
      },
      description: 'Body combines properties of CreateMovieDTO and a <i>poster</i> file in multipart/form-data format.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'When movie successfully created', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'When file not provided or invalid DTO' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'When such movie already exists' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForGetMovie() {
  return applyDecorators(
    ApiOperation({ summary: 'Get movie by ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Found movie', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad or not existing ID' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForGetMovies() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all movies sorted by release date in descending order' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Retrieved movies list', type: [MovieDTO] }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForPutUpdatePoster() {
  return applyDecorators(
    ApiOperation({ summary: 'Replace poster for a movie' }),
    ApiConsumes('multipart/form-data'),
    ApiParam({ name: 'id', description: 'Movie ID', required: true }),
    ApiBody({
      schema: {
        type: 'object',
        allOf: [{ properties: { poster: { type: 'string', format: 'binary' } }, required: ['poster'] }],
      },
      description: 'Body is a <i>poster</i> file in multipart/form-data format.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Updated movie poster with given file', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Requested movie does not exist' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'When file or id not provided',
    }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForPutUpdateBackdrop() {
  return applyDecorators(
    ApiOperation({ summary: 'Replace backdrop for a movie' }),
    ApiConsumes('multipart/form-data'),
    ApiParam({ name: 'id', description: 'Movie ID', required: true }),
    ApiBody({
      schema: {
        type: 'object',
        allOf: [{ properties: { backdrop: { type: 'string', format: 'binary' } }, required: ['backdrop'] }],
      },
      description: 'Body is a <i>backdrop</i> file in multipart/form-data format.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Updated movie backdrop with given file', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Requested movie does not exist' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'When file or id not provided',
    }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForPatchMovie() {
  return applyDecorators(
    ApiOperation({ summary: 'Update movie by ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Updated movie', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request (e.g. invalid ID or DTO)' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Requested movie does not exist' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForImportMovie() {
  return applyDecorators(
    ApiOperation({ summary: 'Import movie from external provider' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'When movie successfully imported', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'When external title not found' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForPutMoviePublished() {
  return applyDecorators(
    ApiOperation({ summary: 'Set a movie as published' }),
    ApiParam({ name: 'id', description: 'Movie ID', required: true }),
    ApiResponse({ status: HttpStatus.OK, description: 'Changed movie state to published', type: MovieDTO }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid id' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Requested movie does not exist' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForDeleteMoviePublished() {
  return applyDecorators(
    ApiOperation({ summary: 'Set a movie as unpublished' }),
    ApiParam({ name: 'id', description: 'Movie ID', required: true }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Changed movie state to unpublished',
      type: MovieDTO,
      example: { '...': '...', isPublished: false, '....': '...' },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid id' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Requested movie does not exist' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

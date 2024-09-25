import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
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

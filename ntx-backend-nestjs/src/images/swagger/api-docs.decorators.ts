import { applyDecorators, HttpStatus, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { BACKDROP_MIME_TYPE, POSTER_MIME_TYPE } from '../images.constants';
import { PosterSize } from '../images.types';

export function ApiDocsForGetPoster() {
  return applyDecorators(
    ApiOperation({ summary: 'Get poster by ID and size' }),
    ApiProduces(POSTER_MIME_TYPE),
    ApiParam({
      name: 'size',
      type: String,
      description: Object.keys(PosterSize).toString(),
      example: PosterSize.L,
      required: false,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Found poster', type: StreamableFile }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Did not find requested poster' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

export function ApiDocsForGetBackdrop() {
  return applyDecorators(
    ApiOperation({ summary: 'Get backdrop by ID' }),
    ApiProduces(BACKDROP_MIME_TYPE),
    ApiResponse({ status: HttpStatus.OK, description: 'Found backdrop', type: StreamableFile }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad or not existing ID' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

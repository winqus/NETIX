import { applyDecorators, HttpStatus, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { PosterSize } from '../images.types';

export function ApiDocsForGetPoster() {
  return applyDecorators(
    ApiOperation({ summary: 'Get poster by ID and size' }),
    ApiProduces('image/webp'),
    ApiParam({
      name: 'size',
      type: String,
      description: Object.keys(PosterSize).toString(),
      example: PosterSize.L,
      required: false,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Found poster', type: StreamableFile }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad or not existing ID' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

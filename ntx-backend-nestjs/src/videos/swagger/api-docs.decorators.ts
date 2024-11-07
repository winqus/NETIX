import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VideoDTO } from '../dto/video.dto';

export function ApiDocsForGetVideo() {
  return applyDecorators(
    ApiOperation({ summary: 'Get video information by ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Found video', type: VideoDTO }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

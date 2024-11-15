import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiHeaders, ApiOperation, ApiResponse } from '@nestjs/swagger';
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

export function ApiDocsForGetVideoStream() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a video stream by video ID' }),
    ApiHeaders([
      {
        name: 'Range',
        description: 'Byte range',
        examples: {
          FirstRequest: { value: 'bytes=0-' },
          NextPossibleRequest: { value: 'bytes=316571648-520145356' },
        },
      },
    ]),
    ApiResponse({
      status: HttpStatus.PARTIAL_CONTENT,
      description:
        'Returns video stream chunk. Response Headers: Accept-Ranges, Content-Type, Content-Range, Content-Length',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' }),
    ApiResponse({ status: HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE, description: 'Requested range not satisfiable' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server internal error. Check server logs' }),
  );
}

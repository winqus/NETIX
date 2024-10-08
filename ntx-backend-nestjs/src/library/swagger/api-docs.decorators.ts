import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import { Providers } from '../library.constants';

export function ApiDocsForSearch() {
  const providersDescription = `Comma-separated list from values: ${Object.keys(Providers).join(', ')}`;
  const typesDescription = `${Object.keys(TitleType).join(',')}`;

  return applyDecorators(
    ApiOperation({ summary: 'Search for titles' }),
    ApiQuery({ name: 'types', required: true, type: String, description: typesDescription }),
    ApiQuery({
      name: 'providers',
      required: true,
      type: String,
      description: providersDescription,
    }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'query', required: true, type: String, example: 'shrek' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Search results',
      schema: {
        type: 'object',
        properties: {
          size: { type: 'integer', example: 0 },
          searchResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'ntx' },
                size: { type: 'integer', example: 0 },
                results: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
            example: [
              {
                id: 'ntx',
                size: 0,
                results: [],
              },
              {
                id: 'ntx-discovery',
                size: 0,
                results: [],
              },
            ],
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid query parameters' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' }),
  );
}

export function ApiDocsForGetExternalTitleMetadata() {
  const providerDescription = `Comma-separated list from values: ${Object.keys(ExternalProviders).join(', ')}`;

  return applyDecorators(
    ApiOperation({ summary: 'Get external movie metadata' }),
    ApiParam({ name: 'id', required: true, type: String, description: 'External movie ID' }),
    ApiQuery({
      name: 'providerID',
      required: true,
      type: String,
      example: 'TMDB',
      description: providerDescription,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Metadata retrieved',
      schema: {
        type: 'object',
        properties: {
          externalID: { type: 'string', example: '11' },
          providerID: { type: 'string', example: 'TMDB' },
          type: { type: 'string', example: 'MOVIE' },
          metadata: { type: 'object' },
          posterURL: { type: 'string', example: 'https://example.com/poster.jpg' },
          backdropURL: { type: 'string', example: 'https://example.com/backdrop.jpg' },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid parameters' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Metadata not found' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' }),
  );
}

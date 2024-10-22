import { TestBed } from '@automock/jest';
import { BadRequestException } from '@nestjs/common';
import { replaceLoggerPropertyWithMock } from '@ntx-test/utils/logger.utils';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import {
  EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN,
  EXTERNAL_TITLE_SEARCHER_TOKEN,
  EXTERNAL_TITLE_SELECTOR_TOKEN,
  ExternalProviders,
} from './external-providers.constants';
import { ExternalTitleMetadataRequest, ExternalTitleSearchRequest } from './external-providers.types';
import { ExternalTitleService } from './external-title.service';
import { IExternalTitleMetadataRetriever } from './interfaces/external-title-metadata-retriever.interface';
import { IExternalTitleSearcher } from './interfaces/external-title-searcher.interface';
import { IExternalTitleSelector } from './interfaces/external-title-selector.interface';

describe('ExternalTitleService', () => {
  let service: ExternalTitleService;
  let searcher: IExternalTitleSearcher;
  let selector: IExternalTitleSelector;
  let metadataRetriever: IExternalTitleMetadataRetriever;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(ExternalTitleService).compile();

    service = unit;
    replaceLoggerPropertyWithMock(service);
    searcher = unitRef.get(EXTERNAL_TITLE_SEARCHER_TOKEN);
    selector = unitRef.get(EXTERNAL_TITLE_SELECTOR_TOKEN);
    metadataRetriever = unitRef.get(EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(searcher).toBeDefined();
    expect(selector).toBeDefined();
    expect(metadataRetriever).toBeDefined();
  });

  describe('search', () => {
    it('should throw BadRequestException if query is empty', async () => {
      const request: ExternalTitleSearchRequest = { query: '   ' };

      await expect(service.search(request)).rejects.toThrow(BadRequestException);
    });

    it('should trim the query string', async () => {
      const request: ExternalTitleSearchRequest = { query: '  test  ' };
      searcher.searchTitleByName = jest.fn().mockResolvedValue([]);
      selector.select = jest.fn().mockResolvedValue([]);

      await service.search(request);

      expect(request.query).toBe('test');
    });

    it('should set default types if none provided', async () => {
      const request: ExternalTitleSearchRequest = { query: 'test' };
      searcher.searchTitleByName = jest.fn().mockResolvedValue([]);
      selector.select = jest.fn().mockResolvedValue([]);

      await service.search(request);

      expect(request.types).toEqual(Object.values(TitleType));
    });

    it('should throw BadRequestException for invalid types', async () => {
      const request: ExternalTitleSearchRequest = {
        query: 'test',
        types: ['InvalidType'] as any,
      };

      await expect(service.search(request)).rejects.toThrow(BadRequestException);
    });

    it('should set default providers if none provided', async () => {
      const request: ExternalTitleSearchRequest = { query: 'test' };
      searcher.searchTitleByName = jest.fn().mockResolvedValue([]);
      selector.select = jest.fn().mockResolvedValue([]);

      await service.search(request);

      expect(request.providers).toEqual(Object.values(ExternalProviders));
    });

    it('should set default maxResults if invalid', async () => {
      const request: ExternalTitleSearchRequest = { query: 'test', maxResults: -1 };
      searcher.searchTitleByName = jest.fn().mockResolvedValue([]);
      selector.select = jest.fn().mockResolvedValue([]);

      await service.search(request);

      expect(request.maxResults).toBeDefined();
    });

    it('should call searcher and selector with correct parameters', async () => {
      const request: ExternalTitleSearchRequest = { query: 'test' };
      const candidates = [{ id: 1 }];
      const selectedResults = [{ id: 1 }];

      searcher.searchTitleByName = jest.fn().mockResolvedValue(candidates);
      selector.select = jest.fn().mockResolvedValue(selectedResults);

      const result = await service.search(request);

      expect(searcher.searchTitleByName).toHaveBeenCalledWith(request);
      expect(selector.select).toHaveBeenCalledWith({
        candidates,
        searchedQuery: request.query,
      });
      expect(result).toEqual({ size: selectedResults.length, results: selectedResults });
    });

    it('should handle errors and log them', async () => {
      const request: ExternalTitleSearchRequest = { query: 'test' };
      const error = new Error('Test Error');
      searcher.searchTitleByName = jest.fn().mockRejectedValue(error);

      await expect(service.search(request)).rejects.toThrow(error);
    });
  });

  describe('getTitleMetadata', () => {
    it('should throw BadRequestException if externalID is empty', async () => {
      const request: ExternalTitleMetadataRequest<TitleType.MOVIE> = {
        externalID: '   ',
        providerID: 'provider',
        type: TitleType.MOVIE,
      };

      await expect(service.getTitleMetadata(request)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if providerID is empty', async () => {
      const request: ExternalTitleMetadataRequest<TitleType.MOVIE> = {
        externalID: 'id',
        providerID: '   ',
        type: TitleType.MOVIE,
      };

      await expect(service.getTitleMetadata(request)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if type is invalid', async () => {
      const request: ExternalTitleMetadataRequest<any> = {
        externalID: 'id',
        providerID: 'provider',
        type: 'InvalidType' as any,
      };

      await expect(service.getTitleMetadata(request)).rejects.toThrow(BadRequestException);
    });

    it('should call metadataRetriever.getMetadata with correct parameters', async () => {
      const request: ExternalTitleMetadataRequest<any> = {
        externalID: 'id',
        providerID: 'provider',
        type: TitleType.MOVIE,
      };
      const metadataResult = { title: 'Test Movie' };
      metadataRetriever.getMetadata = jest.fn().mockResolvedValue(metadataResult);

      const result = await service.getTitleMetadata(request);

      expect(metadataRetriever.getMetadata).toHaveBeenCalledWith(request);
      expect(result).toEqual(metadataResult);
    });

    it('should handle errors and log them', async () => {
      const request: ExternalTitleMetadataRequest<any> = {
        externalID: 'id',
        providerID: 'provider',
        type: TitleType.MOVIE,
      };
      const error = new Error('Test Error');
      metadataRetriever.getMetadata = jest.fn().mockRejectedValue(error);

      await expect(service.getTitleMetadata(request)).rejects.toThrow(error);
    });
  });
});

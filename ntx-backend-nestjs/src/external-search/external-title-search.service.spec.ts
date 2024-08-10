import { TestBed } from '@automock/jest';
import { ExternalTitleSearchService } from './external-title-search.service';

describe('ExternalTitleSearchService', () => {
  let service: ExternalTitleSearchService;

  beforeEach(async () => {
    const { unit } = TestBed.create(ExternalTitleSearchService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

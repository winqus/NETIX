import { TestBed } from '@automock/jest';
import { ExternalTitleService } from './external-title-search.service';

describe('ExternalTitleService', () => {
  let service: ExternalTitleService;

  beforeEach(async () => {
    const { unit } = TestBed.create(ExternalTitleService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

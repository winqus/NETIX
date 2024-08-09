import { TestBed } from '@automock/jest';
import { TitlesService } from './titles.service';

describe('TitlesService', () => {
  let service: TitlesService;

  beforeAll(() => {
    const { unit } = TestBed.create(TitlesService).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { TestBed } from '@automock/jest';
import { ExternalTitleSearchController } from './external-title-search.controller';

describe('ExternalTitleSearchController', () => {
  let controller: ExternalTitleSearchController;

  beforeEach(async () => {
    const { unit } = TestBed.create(ExternalTitleSearchController).compile();

    controller = unit;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

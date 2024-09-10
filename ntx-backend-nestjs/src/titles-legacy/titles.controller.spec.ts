import { TestBed } from '@automock/jest';
import { TitlesController } from './titles.controller';

describe('TitlesController', () => {
  let controller: TitlesController;

  beforeAll(() => {
    const { unit } = TestBed.create(TitlesController).compile();

    controller = unit;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

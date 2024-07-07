import { Test, TestingModule } from '@nestjs/testing';
import { TitleSearchPluginLoaderService } from './plugins/title-search-plugin-loader.service';
import { SearchController } from './search.controller';

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: TitleSearchPluginLoaderService,
          useValue: {
            loadPlugins: jest.fn(() => true),
            getPlugins: jest.fn(() => []),
          },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

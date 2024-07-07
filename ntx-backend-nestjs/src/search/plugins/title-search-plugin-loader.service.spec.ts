import { Test, TestingModule } from '@nestjs/testing';
import { TitleSearchPluginLoaderService } from './title-search-plugin-loader.service';

describe('TitleSearchPluginLoaderService', () => {
  let service: TitleSearchPluginLoaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TitleSearchPluginLoaderService],
    }).compile();

    service = module.get<TitleSearchPluginLoaderService>(
      TitleSearchPluginLoaderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

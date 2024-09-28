import { Test, TestingModule } from '@nestjs/testing';
import { ExternalProvidersModule } from './external-providers.module';
import { ExternalTitleService } from './external-title.service';

describe('ExternalProvidersModule', () => {
  describe('forRoot', () => {
    it('creates', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [ExternalProvidersModule.forRoot()],
      }).compile();

      const externalTitleService = module.get(ExternalTitleService);

      expect(externalTitleService).toBeInstanceOf(ExternalTitleService);
    });
  });
});

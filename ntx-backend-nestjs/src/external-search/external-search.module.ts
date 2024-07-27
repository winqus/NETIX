import { Module } from '@nestjs/common';
import { TitleSearchPluginLoaderService } from './plugins/title-search-plugin-loader.service';
import { SearchController } from './search.controller';

// TODO: rename to ExternalSearchModule, file also to external-search.module.ts, and the folder src/search to src/external-search
@Module({
  providers: [TitleSearchPluginLoaderService],
  controllers: [SearchController],
})
export class ExternalSearchModule {}

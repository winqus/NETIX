import { Module } from '@nestjs/common';
import { TitleSearchPluginLoaderService } from './plugins/title-search-plugin-loader.service';
import { SearchController } from './search.controller';

@Module({
  providers: [TitleSearchPluginLoaderService],
  controllers: [SearchController],
})
export class SearchModule {}

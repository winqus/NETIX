import { Logger, Module } from '@nestjs/common';
import { ExternalTitleSearchController } from './external-title-search.controller';
import { ExternalTitleSearchService } from './external-title-search.service';
import { TMDBSearchTitleService } from './plugins/tmdb-search-title/TMDB-search-title.service';

@Module({
  providers: [TMDBSearchTitleService, ExternalTitleSearchService],
  controllers: [ExternalTitleSearchController],
  exports: [ExternalTitleSearchService],
})
export class ExternalSearchModule {}

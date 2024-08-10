import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalSearchModule } from '@ntx/external-search/external-search.module';
import { MoviesController } from './movies/movies.controller';
import { MoviesRepository } from './movies/movies.repository';
import { MoviesService } from './movies/movies.service';
import { SeriesController } from './series/series.controller';
import { SeriesRepository } from './series/series.repository';
import { SeriesService } from './series/series.service';
import { TitlesController } from './titles.controller';
import { titlesProviders } from './titles.providers';
import { TitlesRepository } from './titles.repository';
import { TitlesService } from './titles.service';

@Module({
  imports: [DatabaseModule, ExternalSearchModule],
  controllers: [TitlesController, MoviesController, SeriesController],
  providers: [
    ...titlesProviders,
    TitlesRepository,
    TitlesService,
    MoviesRepository,
    MoviesService,
    SeriesRepository,
    SeriesService,
  ],
  exports: [TitlesService],
})
export class TitlesModule {}

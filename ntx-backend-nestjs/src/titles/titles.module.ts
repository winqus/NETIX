import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalSearchModule } from '@ntx/external-search/external-search.module';
import { TitlesController } from './titles.controller';
import { titlesProviders } from './titles.providers';
import { TitlesService } from './titles.service';

@Module({
  controllers: [TitlesController],
  providers: [TitlesService, ...titlesProviders],
  imports: [DatabaseModule, ExternalSearchModule],
})
export class TitlesModule {}

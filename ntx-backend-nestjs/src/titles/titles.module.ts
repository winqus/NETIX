import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalSearchModule } from '@ntx/external-search/external-search.module';
import { TitlesController } from './titles.controller';
import { titlesProviders } from './titles.providers';
import { TitlesRepository } from './titles.repository';
import { TitlesService } from './titles.service';

@Module({
  imports: [DatabaseModule, ExternalSearchModule],
  controllers: [TitlesController],
  providers: [...titlesProviders, TitlesRepository, TitlesService],
})
export class TitlesModule {}

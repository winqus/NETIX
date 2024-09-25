import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalTitleSearchController } from './external-title-search.controller';
import { ExternalTitleSearchService } from './external-title-search.service';
import { importedInformationProviders } from './imported-information.providers';
import { ImportedInformationRepository } from './imported-information.repository';
import { ImportedInformationService } from './imported-information.service';
import { TMDBSearchTitleService } from './plugins/tmdb-search-title/TMDB-search-title.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    TMDBSearchTitleService,
    ExternalTitleSearchService,
    ...importedInformationProviders,
    ImportedInformationRepository,
    ImportedInformationService,
  ],
  controllers: [ExternalTitleSearchController],
  exports: [ExternalTitleSearchService, ImportedInformationService],
})
export class ExternalProvidersModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalProvidersModule } from '@ntx/external-providers/external-providers.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { ImagesModule } from '@ntx/images/images.module';
import { MoviesImportController } from './movies-import.controller';
import { MoviesController } from './movies.controller';
import { moviesProviders } from './movies.providers';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController, MoviesImportController],
  providers: [...moviesProviders, MoviesRepository, MoviesService],
  imports: [DatabaseModule, FileStorageModule, ImagesModule, ExternalProvidersModule],
  exports: [MoviesService],
})
export class MoviesModule {}

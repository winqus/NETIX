import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalProvidersModule } from '@ntx/external-providers/external-providers.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { ImagesModule } from '@ntx/images/images.module';
import { VideosModule } from '@ntx/videos/videos.module';
import { MovieEventSubscriber } from './events/movies.subscriber';
import { MovieAuditLogsRepository } from './movie-audit-logs.repository';
import { MoviesImportController } from './movies-import.controller';
import { MoviesController } from './movies.controller';
import { moviesProviders } from './movies.providers';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController, MoviesImportController],
  providers: [...moviesProviders, MoviesRepository, MoviesService, MovieEventSubscriber, MovieAuditLogsRepository],
  imports: [DatabaseModule, FileStorageModule, ImagesModule, ExternalProvidersModule, VideosModule],
  exports: [MoviesService],
})
export class MoviesModule {}

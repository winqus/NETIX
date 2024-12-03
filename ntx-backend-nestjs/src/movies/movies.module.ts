import { Module } from '@nestjs/common';
import { AuthModule } from '@ntx/auth/auth.module';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalProvidersModule } from '@ntx/external-providers/external-providers.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { ImagesModule } from '@ntx/images/images.module';
import { VideosModule } from '@ntx/videos/videos.module';
import { MovieEventSubscriber } from './events/movies.subscriber';
import { MoviesAuditLogController } from './movie-audit-logs.controller';
import { MovieAuditLogsRepository } from './movie-audit-logs.repository';
import { MovieAuditLogsService } from './movie-audit-logs.service';
import { MoviesImportController } from './movies-import.controller';
import { MoviesController } from './movies.controller';
import { moviesProviders } from './movies.providers';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController, MoviesImportController, MoviesAuditLogController],
  providers: [
    ...moviesProviders,
    MoviesRepository,
    MoviesService,
    MovieAuditLogsService,
    MovieEventSubscriber,
    MovieAuditLogsRepository,
  ],
  imports: [AuthModule, DatabaseModule, FileStorageModule, ImagesModule, ExternalProvidersModule, VideosModule],
  exports: [MoviesService, MovieAuditLogsService],
})
export class MoviesModule {}

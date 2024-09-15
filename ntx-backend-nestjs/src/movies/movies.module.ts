import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { ImagesModule } from '@ntx/images/images.module';
import { PosterService } from '@ntx/images/poster.service';
import { MoviesController } from './movies.controller';
import { moviesProviders } from './movies.providers';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController],
  providers: [...moviesProviders, MoviesRepository, MoviesService, FileStorageService, PosterService],
  imports: [DatabaseModule, FileStorageModule, ImagesModule],
})
export class MoviesModule {}

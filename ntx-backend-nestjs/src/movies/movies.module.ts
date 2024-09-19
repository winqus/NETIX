import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { ImagesModule } from '@ntx/images/images.module';
import { MoviesController } from './movies.controller';
import { moviesProviders } from './movies.providers';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController],
  providers: [...moviesProviders, MoviesRepository, MoviesService],
  imports: [DatabaseModule, FileStorageModule, ImagesModule],
})
export class MoviesModule {}

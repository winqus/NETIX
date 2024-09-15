import { Module } from '@nestjs/common';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, FileStorageService],
  imports: [FileStorageModule],
})
export class MoviesModule {}

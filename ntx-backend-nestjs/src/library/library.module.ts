import { Module } from '@nestjs/common';
import { ExternalProvidersModule } from '@ntx/external-providers/external-providers.module';
import { MoviesModule } from '@ntx/movies/movies.module';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
  controllers: [LibraryController],
  providers: [LibraryService],
  imports: [MoviesModule, ExternalProvidersModule],
})
export class LibraryModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core/constants';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import { DEFAULT_THROTTLE_LIMIT, DEFAULT_THROTTLE_TTL } from './app.constants';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ExternalSearchModule } from './external-search/external-search.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { StorageType } from './file-storage/types';
import { ImagesModule } from './images/images.module';
import { JobQueueModule } from './job-queue/job-queue.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    FileStorageModule.forRoot(
      StorageType.LocalFileSystem,
      {
        [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: resolve('.temp-data/storage') } },
      },
      true,
    ),
    JobQueueModule.forRootAsync(),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: DEFAULT_THROTTLE_TTL,
        limit: DEFAULT_THROTTLE_LIMIT,
      },
    ]),
    ExternalSearchModule,
    ImagesModule,
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

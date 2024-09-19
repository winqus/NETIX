import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core/constants';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import {
  DEFAULT_FILE_STORAGE_BASE_DIR_PATH,
  DEFAULT_TEMP_FILE_STORAGE_BASE_DIR_PATH,
  DEFAULT_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_TTL,
  ENV_FILE,
} from './app.constants';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ExternalSearchModule } from './external-search/external-search.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { StorageType } from './file-storage/types';
import { ImagesModule } from './images/images.module';
import { JobQueueModule } from './job-queue/job-queue.module';
import { MoviesModule } from './movies/movies.module';

function getStorageBaseDirPath() {
  if (process.env.USE_TEMPORARY_FILE_STORAGE === 'true') {
    const tempDirPath = process.env.TEMP_FILE_STORAGE_BASE_DIR_PATH || DEFAULT_TEMP_FILE_STORAGE_BASE_DIR_PATH;

    return resolve(tempDirPath);
  } else {
    return resolve(DEFAULT_FILE_STORAGE_BASE_DIR_PATH);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ENV_FILE }),
    DatabaseModule,
    FileStorageModule.forRoot(
      StorageType.LocalFileSystem,
      {
        [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: getStorageBaseDirPath() } },
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

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core/constants';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { makeCounterProvider, makeHistogramProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
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
import { ExternalProvidersModule } from './external-providers/external-providers.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { StorageType } from './file-storage/types';
import { ImagesModule } from './images/images.module';
import { JobQueueModule } from './job-queue/job-queue.module';
import { LibraryModule } from './library/library.module';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { MoviesModule } from './movies/movies.module';
import { VideosModule } from './videos/videos.module';

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
    CacheModule.register({ isGlobal: true }),
    ExternalProvidersModule.forRoot({
      TMDB: {
        enable: true,
        apiKey: process.env.TMDB_API_KEY || '',
        rateLimitMs: 5,
      },
    }),
    ImagesModule,
    MoviesModule,
    LibraryModule,
    VideosModule,
    PrometheusModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    makeCounterProvider({
      name: 'request_counter',
      help: 'Counts the number of HTTP requests',
      labelNames: ['method', 'route'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
    }),
  ],
})
export class AppModule {}

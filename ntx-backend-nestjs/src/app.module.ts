import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core/constants';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import {
  DEFAULT_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_TTL,
  QUEUE_HOST,
  QUEUE_PASSWORD,
  QUEUE_PORT,
  QUEUE_UI_ROUTE,
} from './app.constants';
import { DatabaseModule } from './database/database.module';
import { ExternalSearchModule } from './external-search/external-search.module';
import { JobQueueModule } from './job-queue/job-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
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

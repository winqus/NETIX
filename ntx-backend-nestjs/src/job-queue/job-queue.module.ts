import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Module } from '@nestjs/common';
import { QUEUE_UI_ROUTE } from '@ntx/app.constants';
import { REDIS_CONNECTION_OPTIONS_TOKEN } from '@ntx/database/database.constants';
import { DatabaseModule } from '@ntx/database/database.module';
import { RedisConnectionOptions } from '@ntx/database/database.types';

@Module({})
export class JobQueueModule {
  static forRootAsync(): DynamicModule {
    return {
      module: JobQueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [DatabaseModule],
          inject: [REDIS_CONNECTION_OPTIONS_TOKEN],
          useFactory: async (redisConnection: RedisConnectionOptions) => redisConnection,
        }),
        BullBoardModule.forRoot({
          route: QUEUE_UI_ROUTE,
          adapter: ExpressAdapter,
        }),
      ],
    };
  }

  static register(queueName: string): DynamicModule {
    const bullQueueModule = BullModule.registerQueue({
      name: queueName,
    });

    const bullBoardModule = BullBoardModule.forFeature({
      name: queueName,
      adapter: BullMQAdapter,
    });

    return {
      module: JobQueueModule,
      imports: [bullQueueModule, bullBoardModule],
      exports: [bullQueueModule, bullBoardModule],
    };
  }
}

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_HOST, QUEUE_PASSWORD, QUEUE_PORT, QUEUE_UI_ROUTE } from '@ntx/app.constants';
import RedisMemoryServer from 'redis-memory-server';
import { IN_MEMORY_REDIS_PORT, USE_MEMORY_REDIS } from './job-queue.constants';

@Module({})
export class JobQueueModule {
  static forRootAsync(): DynamicModule {
    return {
      module: JobQueueModule,
      imports: [
        ConfigModule,
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            if (configService.get(USE_MEMORY_REDIS) === 'true') {
              let port = configService.get(IN_MEMORY_REDIS_PORT);
              port = port != null ? parseInt(port, 10) : null;

              const redisServer = await RedisMemoryServer.create({
                instance: {
                  ip: '127.0.0.1',
                  port: port,
                },
                binary: {
                  version: '7.2.4',
                },
              });
              const redisServerHost = await redisServer.getHost();
              const redisServerPort = await redisServer.getPort();

              new Logger('JobQueueModule').warn(`Using in-memory Redis at ${redisServerHost}:${redisServerPort}`);

              return {
                connection: {
                  host: redisServerHost,
                  port: redisServerPort,
                },
              };
            } else {
              return {
                connection: {
                  host: configService.get(QUEUE_HOST),
                  port: configService.get(QUEUE_PORT),
                  password: configService.get(QUEUE_PASSWORD),
                },
              };
            }
          },
          inject: [ConfigService],
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

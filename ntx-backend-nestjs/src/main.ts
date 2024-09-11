import { VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { DEFAULT_CONTROLLER_VERSION, DEFAULT_PORT, ENV, GLOBAL_ROUTE_PREFIX, PORT } from './app.constants';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = WinstonModule.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('NTX-Nest', {
        processId: true,
        appName: true,
      }),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          nestWinstonModuleUtilities.format.nestLike('NTX-Nest', {
            colors: true,
            prettyPrint: true,
          }),
          winston.format.colorize({ all: true }),
        ),
        handleExceptions: true,
        handleRejections: true,
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-error.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-combined.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
      }),
    ],
  });
  app.useLogger(logger);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_CONTROLLER_VERSION,
  });

  app.enableCors();
  app.setGlobalPrefix(GLOBAL_ROUTE_PREFIX);

  await app.listen(process.env[PORT] || DEFAULT_PORT);

  console.log(`✨ Application (ENV: ${process.env[ENV]}) is running on: ${await app.getUrl()}/${GLOBAL_ROUTE_PREFIX}`);
}
bootstrap();

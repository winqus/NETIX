import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_CONTROLLER_VERSION, DEFAULT_PORT, ENV, GLOBAL_ROUTE_PREFIX, PORT } from './constants';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService));

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

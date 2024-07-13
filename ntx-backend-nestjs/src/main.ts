import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_CONTROLLER_VERSION, DEFAULT_PORT, GLOBAL_PREFIX, PORT } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_CONTROLLER_VERSION,
  });

  app.setGlobalPrefix(GLOBAL_PREFIX);

  await app.listen(process.env[PORT] || DEFAULT_PORT);

  console.log(`Application is running on: ${await app.getUrl()}/${GLOBAL_PREFIX}`);
}
bootstrap();

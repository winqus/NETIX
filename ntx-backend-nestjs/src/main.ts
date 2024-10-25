import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Server } from '@tus/server';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import {
  DEFAULT_CONTROLLER_VERSION,
  DEFAULT_PORT,
  ENV,
  ENVIRONMENTS,
  GLOBAL_ROUTE_PREFIX,
  PORT,
  SWAGGER_DESCRIPTION,
  SWAGGER_JSON_ROUTE,
  SWAGGER_ROUTE,
  SWAGGER_TAGS,
  SWAGGER_TITLE,
  SWAGGER_VERSION,
  SWAGGER_YAML_ROUTE,
} from './app.constants';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';
import { FileStorageService } from './file-storage/file-storage.service';
import { FileStorageDataStore } from './file-storage/tus/file-storage-data-store.tus';
import { FileStorageFileConfigStore } from './file-storage/tus/file-storage-file-config-store.tus';

async function bootstrapSwagger(app: INestApplication<any>) {
  const swaggerDocBuilder = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION);

  SWAGGER_TAGS.forEach((tag) => {
    swaggerDocBuilder.addTag(tag);
  });

  const swaggerConfig = swaggerDocBuilder.build();

  const openAPIdocument = SwaggerModule.createDocument(app, swaggerConfig, {});
  SwaggerModule.setup(SWAGGER_ROUTE, app, openAPIdocument, {
    jsonDocumentUrl: SWAGGER_JSON_ROUTE,
    yamlDocumentUrl: SWAGGER_YAML_ROUTE,
  });
}

async function bootstrap() {
  require('dotenv').config({ override: true });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configSrv = app.get(ConfigService);
  const env = configSrv.get(ENV);

  const logger = WinstonModule.createLogger({
    level: env === ENVIRONMENTS.DEVELOPMENT ? 'debug' : 'warn',
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
  app.enableShutdownHooks();

  const fileStorage = app.get(FileStorageService);

  const tusServer = new Server({
    path: '/files',
    datastore: new FileStorageDataStore({
      destinationContainer: 'some-large-uploads',
      fileStorage: fileStorage,
      configstore: new FileStorageFileConfigStore({
        destinationContainer: 'upload-metadata',
        fileStorage: fileStorage,
      }),
      expirationPeriodInMilliseconds: 0,
    }),
  });

  app.use('/files', tusServer.handle.bind(tusServer));

  if (env === ENVIRONMENTS.DEVELOPMENT) {
    await bootstrapSwagger(app);
  }

  await app.listen(configSrv.get(PORT, DEFAULT_PORT));

  if (env === ENVIRONMENTS.DEVELOPMENT) {
    new Logger('Bootstrap').verbose(`📚 Swagger OpenAPI docs are running on: ${await app.getUrl()}/swagger`);
  }
  new Logger('Bootstrap').verbose(
    `✨ Application (ENV: ${env}) is running on: ${await app.getUrl()}/${GLOBAL_ROUTE_PREFIX}`,
  );
}
bootstrap();

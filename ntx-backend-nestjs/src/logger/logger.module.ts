import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

const LOGGER_CONTEXT = 'LOGGER_CONTEXT';
const LOGGER_OPTIONS = 'LOGGER_OPTIONS';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_CONTEXT,
      useValue: 'DefaultContext', // Default context value
    },
    {
      provide: LOGGER_OPTIONS,
      useValue: { timestamp: true }, // Default options value
    },
    {
      provide: LoggerService,
      useFactory: (context: string, options: { timestamp?: boolean }) => new LoggerService(context, options),
      inject: [LOGGER_CONTEXT, LOGGER_OPTIONS],
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}

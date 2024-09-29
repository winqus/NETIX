import { Logger, LoggerService } from '@nestjs/common/services/logger.service';

export const loggerServiceMock = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  fatal: jest.fn(),
} as jest.Mocked<LoggerService>;

export const loggerMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  fatal: jest.fn(),
} as unknown as jest.Mocked<Logger>;

/**
 * Replaces the `logger` property of the given service/class with a mock logger (each method becomes jest.fn()).
 *
 * @param service - The service whose `logger` property will be replaced.
 * @returns The mocked logger.
 */
export const replaceLoggerPropertyWithMock = (service: any): jest.Mocked<Logger> => {
  if ('logger' in service === false || typeof service.logger !== 'object') {
    throw new Error(`The service/class does not have a logger property.`);
  }

  jest.replaceProperty(service, 'logger', loggerMock);

  return loggerMock;
};

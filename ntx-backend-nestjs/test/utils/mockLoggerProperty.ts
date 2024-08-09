import { Logger } from '@nestjs/common/services/logger.service';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
} as unknown as jest.Mocked<Logger>;

export default (service: any): jest.Mocked<Logger> => {
  jest.replaceProperty(service, 'logger', mockLogger);

  return mockLogger;
};

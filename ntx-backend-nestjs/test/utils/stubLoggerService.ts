import { LoggerService } from '@nestjs/common';

export default {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  fatal: jest.fn(),
} as jest.Mocked<LoggerService>;

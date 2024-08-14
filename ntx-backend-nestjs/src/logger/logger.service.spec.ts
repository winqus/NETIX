import { Test, TestingModule } from '@nestjs/testing';
import * as winston from 'winston';
import { LoggerService } from './logger.service';

// Mock winston logger
jest.mock('winston', () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    log: jest.fn(),
  };
  const createLogger = jest.fn(() => mLogger);

  return {
    createLogger,
    transports: { Console: jest.fn(), DailyRotateFile: jest.fn() },
    format: { combine: jest.fn(), timestamp: jest.fn(), printf: jest.fn(), colorize: jest.fn() },
  };
});

describe('LoggerService', () => {
  let service: LoggerService;
  let winstonLogger: winston.Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    winstonLogger = winston.createLogger();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log an info message', () => {
    const message = 'Test log message';
    service.log(message);
    expect(winstonLogger.info).toHaveBeenCalledWith(message);
  });

  it('should log an error message', () => {
    const message = 'Test error message';
    const stack = 'Test stack trace';
    service.error(message, stack);
    expect(winstonLogger.error).toHaveBeenCalledWith(`${message} - ${stack}`);
  });

  it('should log a warn message', () => {
    const message = 'Test warn message';
    service.warn(message);
    expect(winstonLogger.warn).toHaveBeenCalledWith(message);
  });

  it('should log a debug message', () => {
    const message = 'Test debug message';
    service.debug(message);
    expect(winstonLogger.debug).toHaveBeenCalledWith(message);
  });

  it('should log a verbose message', () => {
    const message = 'Test verbose message';
    service.verbose(message);
    expect(winstonLogger.verbose).toHaveBeenCalledWith(message);
  });

  it('should log a fatal message', () => {
    const message = 'Test fatal message';
    service.fatal(message);
    expect(winstonLogger.log).toHaveBeenCalledWith('fatal', message);
  });
});

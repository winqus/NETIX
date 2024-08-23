import { Test, TestingModule } from '@nestjs/testing';
import * as winston from 'winston';
import { LoggerService } from './logger.service';

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
      providers: [
        {
          provide: LoggerService,
          useFactory: () => new LoggerService('TestContext'),
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    winstonLogger = winston.createLogger();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log an info message', () => {
    const message = 'Test log message';
    const expectedMessage = '[TestContext] Test log message';
    service.log(message);
    expect(winstonLogger.info).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log an error message with file and line number', () => {
    const message = 'Test error message';
    const stack = 'Test stack trace';

    const location = service['getCallerLocation']();
    const expectedMessage = `[TestContext] ${message} - ${stack}`;

    service.error(message, stack);

    const expectedFilePath = location.split(':')[0];
    const expectedLineNumber = location.split(':').slice(-2).join(':');

    expect(winstonLogger.error).toHaveBeenCalledWith(
      expectedMessage,
      expect.objectContaining({
        location: expect.stringContaining(expectedFilePath),
      }),
    );
  });

  it('should log a warn message', () => {
    const message = 'Test warn message';
    const expectedMessage = '[TestContext] Test warn message';
    service.warn(message);
    expect(winstonLogger.warn).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log a debug message', () => {
    const message = 'Test debug message';
    const expectedMessage = '[TestContext] Test debug message';
    service.debug(message);
    expect(winstonLogger.debug).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log a verbose message', () => {
    const message = 'Test verbose message';
    const expectedMessage = '[TestContext] Test verbose message';
    service.verbose(message);
    expect(winstonLogger.verbose).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log a fatal message', () => {
    const message = 'Test fatal message';
    const expectedMessage = '[TestContext] Test fatal message';
    service.fatal(message);
    expect(winstonLogger.log).toHaveBeenCalledWith('fatal', expectedMessage);
  });
});

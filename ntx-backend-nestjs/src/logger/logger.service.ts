import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

export interface LogBufferRecord {
  methodRef: (...args: unknown[]) => void;
  arguments: unknown[];
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;
  private options: { timestamp?: boolean };

  constructor(context?: string, options?: { timestamp?: boolean }) {
    this.context = context;
    this.options = options || {};

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`),
          ),
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
  }

  log(message: any, ...optionalParams: any[]) {
    console.log('WORKS console');
    this.logger.info(this.formatMessage(message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.log('WORKS error');
    const stack = optionalParams[0] || '';
    this.logger.error(this.formatMessage(`${message} - ${stack}`, ...optionalParams.slice(1)));
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(this.formatMessage(message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(this.formatMessage(message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(this.formatMessage(message, ...optionalParams));
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.logger.log('fatal', this.formatMessage(message, ...optionalParams));
  }

  setLogLevels(levels: LogLevel[]) {
    this.logger.level = levels.join(',');
  }

  private formatMessage(message: any, ...optionalParams: any[]): string {
    const context = optionalParams[optionalParams.length - 1] === this.context ? optionalParams.pop() : this.context;

    return context ? `[${context}] ${message}` : message;
  }

  // Static Methods
  static logBuffer: LogBufferRecord[] = [];
  static staticInstanceRef?: LoggerService;
  static logLevels?: LogLevel[];
  private static isBufferAttached = false;

  static WrapBuffer() {
    // Buffer wrapping logic here
  }

  static overrideLogger(logger: LoggerService | LogLevel[] | boolean) {
    if (typeof logger === 'boolean') {
      // handle boolean logic
    } else if (Array.isArray(logger)) {
      LoggerService.logLevels = logger;
    } else {
      LoggerService.staticInstanceRef = logger;
    }
  }

  static flush() {
    // Logic to flush buffer
  }

  static attachBuffer() {
    LoggerService.isBufferAttached = true;
  }

  static detachBuffer() {
    LoggerService.isBufferAttached = false;
  }

  static getTimestamp(): string {
    return new Date().toISOString();
  }

  static isLevelEnabled(level: LogLevel): boolean {
    return LoggerService.logLevels?.includes(level) ?? false;
  }

  static error(message: any, ...optionalParams: [...any, string?, string?]) {
    if (LoggerService.staticInstanceRef) {
      LoggerService.staticInstanceRef.error(message, ...optionalParams);
    } else if (LoggerService.isBufferAttached) {
      LoggerService.logBuffer.push({
        methodRef: LoggerService.error,
        arguments: [message, ...optionalParams],
      });
    }
  }

  static log(message: any, ...optionalParams: [...any, string?]) {
    if (LoggerService.staticInstanceRef) {
      LoggerService.staticInstanceRef.log(message, ...optionalParams);
    } else if (LoggerService.isBufferAttached) {
      LoggerService.logBuffer.push({
        methodRef: LoggerService.log,
        arguments: [message, ...optionalParams],
      });
    }
  }

  static warn(message: any, ...optionalParams: [...any, string?]) {
    if (LoggerService.staticInstanceRef) {
      LoggerService.staticInstanceRef.warn(message, ...optionalParams);
    } else if (LoggerService.isBufferAttached) {
      LoggerService.logBuffer.push({
        methodRef: LoggerService.warn,
        arguments: [message, ...optionalParams],
      });
    }
  }

  static debug(message: any, ...optionalParams: [...any, string?]) {
    if (LoggerService.staticInstanceRef) {
      LoggerService.staticInstanceRef.debug(message, ...optionalParams);
    } else if (LoggerService.isBufferAttached) {
      LoggerService.logBuffer.push({
        methodRef: LoggerService.debug,
        arguments: [message, ...optionalParams],
      });
    }
  }

  static verbose(message: any, ...optionalParams: [...any, string?]) {
    if (LoggerService.staticInstanceRef) {
      LoggerService.staticInstanceRef.verbose(message, ...optionalParams);
    } else if (LoggerService.isBufferAttached) {
      LoggerService.logBuffer.push({
        methodRef: LoggerService.verbose,
        arguments: [message, ...optionalParams],
      });
    }
  }

  static fatal(message: any, ...optionalParams: [...any, string?]) {
    if (LoggerService.staticInstanceRef) {
      LoggerService.staticInstanceRef.fatal(message, ...optionalParams);
    } else if (LoggerService.isBufferAttached) {
      LoggerService.logBuffer.push({
        methodRef: LoggerService.fatal,
        arguments: [message, ...optionalParams],
      });
    }
  }
}

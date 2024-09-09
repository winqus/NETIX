import { ArgumentsHost, Catch, HttpException, Logger, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ENVIRONMENTS } from '@ntx/constants';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      if (process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT) {
        if (exception instanceof NotFoundException) {
          new Logger(AllExceptionsFilter.name).error(
            `${exception.getStatus()} - ${exception.name}. ${exception.message}`,
          );
        } else {
          new Logger(AllExceptionsFilter.name).error(exception);
        }
      } else {
        new Logger(AllExceptionsFilter.name).error(
          `${exception.getStatus()} - ${exception.name}. ${exception.message}`,
        );
      }
    }
    super.catch(exception, host);
  }
}

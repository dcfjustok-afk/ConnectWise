import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let code: number;
    let msg: string;
    let httpStatus: number;

    if (exception instanceof BusinessException) {
      code = exception.bizCode;
      msg = exception.message;
      httpStatus = exception.getStatus();
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      code = httpStatus;
      const exResponse = exception.getResponse();
      msg =
        typeof exResponse === 'string'
          ? exResponse
          : (exResponse as { message?: string }).message ?? exception.message;
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      code = httpStatus;
      msg = 'Internal Server Error';
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(httpStatus).json({
      code,
      msg,
      data: null,
    });
  }
}

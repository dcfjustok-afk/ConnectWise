import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions';
import { sanitizeForLog } from '../utils/log-sanitizer';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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
        `Unhandled exception [${request.method} ${request.url}] body=${JSON.stringify(sanitizeForLog(request.body))}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(httpStatus).json({
      ok: false,
      code,
      msg,
      data: null,
    });
  }
}

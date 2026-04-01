import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

type ErrorEnvelope = {
  ok: false;
  code: number;
  msg: string;
  data: null;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { status, body } = this.normalizeException(exception);
    response.status(status).json(body);
  }

  private normalizeException(exception: unknown): {
    status: number;
    body: ErrorEnvelope;
  } {
    if (exception instanceof BusinessException) {
      return {
        status: exception.getStatus(),
        body: {
          ok: false,
          code: exception.businessCode,
          msg: exception.message,
          data: null,
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message = this.extractHttpMessage(payload);

      return {
        status,
        body: {
          ok: false,
          code: status,
          msg: message,
          data: null,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        ok: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        msg: 'Internal server error',
        data: null,
      },
    };
  }

  private extractHttpMessage(payload: unknown): string {
    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload === 'object' && payload !== null) {
      const candidate = (payload as { message?: string | string[] }).message;
      if (Array.isArray(candidate)) {
        return candidate.join(', ');
      }
      if (typeof candidate === 'string') {
        return candidate;
      }
    }

    return 'Request failed';
  }
}

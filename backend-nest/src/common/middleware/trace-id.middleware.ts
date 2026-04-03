import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const TRACE_HEADER = 'x-trace-id';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = (req.headers[TRACE_HEADER] as string) || randomUUID();
    req.headers[TRACE_HEADER] = traceId;
    res.setHeader(TRACE_HEADER, traceId);

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(
        `[${traceId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      );
    });

    next();
  }
}

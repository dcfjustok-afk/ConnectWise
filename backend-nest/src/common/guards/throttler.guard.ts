import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * 自定义 Throttler Guard
 * - 基于 session userId（已登录）或 IP（未登录）做限流键
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.session?.userId;
    if (userId) return `user:${userId}`;
    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  }
}

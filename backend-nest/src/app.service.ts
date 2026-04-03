import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from './prisma/prisma.service';
import { MinioService } from './minio/minio.service';

export interface HealthResult {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  uptime: number;
  checks: {
    db: 'up' | 'down';
    redis: 'up' | 'down';
    minio: 'up' | 'down';
  };
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private redis: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly config: ConfigService,
  ) {}

  /** 注入外部 Redis 实例（由 main.ts 调用） */
  setRedisClient(client: Redis): void {
    this.redis = client;
  }

  async healthCheck(): Promise<HealthResult> {
    const [db, redis, minio] = await Promise.allSettled([
      this.checkDb(),
      this.checkRedis(),
      this.minio.isHealthy(),
    ]);

    const checks = {
      db: db.status === 'fulfilled' && db.value ? ('up' as const) : ('down' as const),
      redis: redis.status === 'fulfilled' && redis.value ? ('up' as const) : ('down' as const),
      minio: minio.status === 'fulfilled' && minio.value ? ('up' as const) : ('down' as const),
    };

    const allUp = checks.db === 'up' && checks.redis === 'up' && checks.minio === 'up';
    const allDown = checks.db === 'down' && checks.redis === 'down' && checks.minio === 'down';

    return {
      status: allUp ? 'ok' : allDown ? 'down' : 'degraded',
      service: 'connectionwise-backend-nest',
      uptime: process.uptime(),
      checks,
    };
  }

  private async checkDb(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      this.logger.warn(`DB health check failed: ${(err as Error).message}`);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    if (!this.redis) {
      // 未注入 Redis 客户端时尝试自建临时连接
      try {
        const host = this.config.get<string>('redis.host', '127.0.0.1');
        const port = this.config.get<number>('redis.port', 6379);
        const client = new Redis({ host, port, lazyConnect: true, connectTimeout: 2000 });
        const pong = await client.ping();
        client.disconnect();
        return pong === 'PONG';
      } catch {
        return false;
      }
    }
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}

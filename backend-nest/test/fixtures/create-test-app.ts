/**
 * 共享 NestJS 测试 App 初始化工厂
 *
 * 封装 createTestingModule → session → prefix → pipes → interceptors → filters 的重复流程，
 * 供所有 e2e 测试复用。
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import * as session from 'express-session';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { MinioService } from '../../src/minio/minio.service';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';

/** Mock MinioService 供所有 e2e 测试复用 */
export function createMockMinioService(): Record<string, any> {
  return {
    onModuleInit: jest.fn(),
    putObject: jest.fn().mockResolvedValue('thumbnails/mock.png'),
    getPresignedUrl: jest.fn().mockResolvedValue('http://minio/mock-url'),
    removeObject: jest.fn().mockResolvedValue(undefined),
    isHealthy: jest.fn().mockResolvedValue(true),
  };
}

export async function createTestApp(
  mockPrisma: Record<string, any>,
  overrides?: { mockMinio?: Record<string, any> },
): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .overrideProvider(MinioService)
    .useValue(overrides?.mockMinio ?? createMockMinioService())
    .overrideProvider(ThrottlerStorage)
    .useValue({ increment: jest.fn().mockResolvedValue({ totalHits: 0, timeToExpire: 0, isBlocked: false, timeToBlockExpire: 0 }) })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(
    session({
      secret: 'test-secret-for-e2e-minimum-16',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.init();
  return app;
}

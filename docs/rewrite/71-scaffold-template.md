# Step 071 脚手架模板固化

> AI 角色：Spec | AI 工具：Copilot Chat | MCP：FS

## 目的

固化 Phase B 验证过的 NestJS 模块脚手架模式，作为 Phase C/D 新模块创建的标准模板。

---

## 一、模块骨架模板

### 1.1 Module（`xxx.module.ts`）

```typescript
import { Module } from '@nestjs/common';
import { XxxController } from './xxx.controller';
import { XxxService } from './xxx.service';

@Module({
  controllers: [XxxController],
  providers: [XxxService],
  exports: [XxxService],
})
export class XxxModule {}
```

**规则**：
- exports 导出 Service，允许其他模块注入
- PrismaModule 已 @Global()，不需要在 imports 中声明
- 在 AppModule 的 imports 中注册新模块

### 1.2 Service（`xxx.service.ts`）

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BizErrorCode, BusinessException } from '../common/exceptions';

@Injectable()
export class XxxService {
  constructor(private readonly prisma: PrismaService) {}

  // 业务方法...
  // 失败时使用 BusinessException + BizErrorCode 抛出
}
```

**规则**：
- 注入 PrismaService 做数据访问
- 所有业务错误使用 `BusinessException` + `BizErrorCode` 抛出
- 不直接操作 HTTP 对象（Request/Response）

### 1.3 Controller（`xxx.controller.ts`）

```typescript
import { Controller, Get, Post, Body, Param, Query, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { XxxService } from './xxx.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('xxx')
export class XxxController {
  constructor(private readonly xxxService: XxxService) {}

  // 默认：需鉴权（全局 AuthGuard）
  // 公开端点：加 @Public()
  // 获取当前用户：@CurrentUser() user
  // POST 返回 200 时：加 @HttpCode(200)
}
```

**规则**：
- 默认受 AuthGuard 保护，公开端点用 `@Public()`
- 使用 `@CurrentUser()` 获取会话用户，不直接读 req.session
- POST 端点如果语义为"操作"（非创建资源），显式 `@HttpCode(200)`

### 1.4 DTO（`dto/xxx.dto.ts`）

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class XxxDto {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  optionalField?: number;
}
```

**规则**：
- 使用 class-validator 装饰器
- 必填字段 `!:` 非空断言
- 可选字段 `?:` + `@IsOptional()`
- ValidationPipe 全局 whitelist + forbidNonWhitelisted 自动生效

---

## 二、单元测试模板

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { XxxService } from './xxx.service';
import { PrismaService } from '../prisma/prisma.service';
import { BizErrorCode } from '../common/exceptions';

describe('XxxService', () => {
  let service: XxxService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      xxx: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XxxService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<XxxService>(XxxService);
  });

  it('应成功执行XXX操作', async () => {
    prisma.xxx.findUnique.mockResolvedValue({ id: 1, /* ... */ });
    const result = await service.someMethod(1);
    expect(result).toBeDefined();
  });

  it('应在资源不存在时抛出异常', async () => {
    prisma.xxx.findUnique.mockResolvedValue(null);
    await expect(service.someMethod(999))
      .rejects.toHaveProperty('bizCode', BizErrorCode.XXX_NOT_FOUND);
  });
});
```

---

## 三、e2e 测试模板

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as session from 'express-session';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

describe('Xxx (e2e)', () => {
  let app: INestApplication;

  const prisma: Record<string, any> = {
    // mock Prisma models...
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(session({
      secret: 'test-secret-for-e2e-minimum-16',
      resave: false,
      saveUninitialized: false,
    }));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 需要鉴权的端点：用 request.agent() 登录后操作
  // 公开端点：直接用 request(app.getHttpServer())
});
```

**前置要求**：
- `test/setup-env.ts` 已配置所有 required 环境变量
- `test/jest-e2e.json` 已配置 `setupFiles: ["./setup-env.ts"]`

---

## 四、新模块接入检查清单

1. [ ] 创建 `src/xxx/xxx.module.ts`
2. [ ] 创建 `src/xxx/xxx.service.ts`
3. [ ] 创建 `src/xxx/xxx.controller.ts`
4. [ ] 创建 `src/xxx/dto/*.dto.ts`
5. [ ] 在 `app.module.ts` imports 中注册 XxxModule
6. [ ] `npm run build` 验证编译通过
7. [ ] 创建 `src/xxx/xxx.service.spec.ts` 单元测试
8. [ ] `npm test` 验证测试通过
9. [ ] 创建 `test/xxx.e2e-spec.ts` e2e 测试
10. [ ] `npm run test:e2e` 验证 e2e 通过

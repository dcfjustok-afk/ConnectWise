# Step 073 日志模板固化

> AI 角色：Spec | AI 工具：Copilot Chat | MCP：FS

## 目的

固化 Phase B 验证过的日志与可观测性模式，作为 Phase C/D/E 的日志标准。

---

## 一、当前日志体系

### 1.1 异常日志（GlobalExceptionFilter）

```typescript
// 仅对未处理异常记录 stack trace
this.logger.error(
  'Unhandled exception',
  exception instanceof Error ? exception.stack : String(exception),
);
```

**位置**：`src/common/filters/global-exception.filter.ts`

**覆盖范围**：
- ✅ 未处理的运行时异常（500）
- ❌ 业务异常（BusinessException）—— 当前不记录，因为是预期行为
- ❌ HTTP 异常（NestJS 内置）—— 当前不记录

### 1.2 NestJS 内置 Logger

**使用方式**：

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class XxxService {
  private readonly logger = new Logger(XxxService.name);

  async someMethod() {
    this.logger.log('操作描述');
    this.logger.warn('告警描述');
    this.logger.error('错误描述', error.stack);
    this.logger.debug('调试信息');
  }
}
```

---

## 二、日志分级标准

| 级别 | 使用场景 | 示例 |
|---|---|---|
| `error` | 系统异常、不可恢复错误 | 数据库连接失败、未处理异常 |
| `warn` | 预期但需关注的状况 | 登录失败次数过多、Redis 重连 |
| `log` | 关键业务事件 | 用户注册、画布创建、分享操作 |
| `debug` | 调试信息（仅开发环境） | 查询参数、中间步骤 |
| `verbose` | 极详细信息（按需） | 请求/响应全量 body |

---

## 三、日志格式规范

### 3.1 标准格式

```
[Nest] {pid} - {timestamp} {level} [{context}] {message}
```

### 3.2 Phase E 增强（Step 160-161 规划）

```json
{
  "timestamp": "2026-04-02T12:00:00.000Z",
  "level": "error",
  "context": "AuthService",
  "traceId": "abc-123",
  "correlationId": "req-456",
  "message": "登录失败",
  "meta": { "username": "alice", "ip": "***" }
}
```

---

## 四、敏感字段脱敏规则（Phase E Step 160 实施）

| 字段 | 脱敏方式 |
|---|---|
| password | 完全不记录 |
| email | `a***@test.com` |
| session secret | 完全不记录 |
| Redis password | 完全不记录 |
| IP 地址 | 完整记录（审计需要） |

---

## 五、Phase B 日志检查清单

| 检查项 | 状态 |
|---|---|
| GlobalExceptionFilter 记录未处理异常 | ✅ |
| 业务异常不泄露 stack trace 给客户端 | ✅ |
| 响应体不包含内部错误详情 | ✅ |
| NestJS Logger 可用于所有 Service | ✅ |
| 敏感信息不出现在日志中 | ✅（当前无主动日志记录敏感字段） |

---

## 六、Phase C/D 日志添加指南

新模块按以下模式添加日志：

```typescript
@Injectable()
export class CanvasService {
  private readonly logger = new Logger(CanvasService.name);

  async create(userId: number, title: string) {
    // 关键业务事件 → log
    this.logger.log(`画布创建: userId=${userId}, title=${title}`);
    // ...
  }

  async delete(canvasId: number, userId: number) {
    // 危险操作 → warn
    this.logger.warn(`画布删除: canvasId=${canvasId}, userId=${userId}`);
    // ...
  }
}
```

**规则**：
1. 每个 Service 声明 `private readonly logger = new Logger(ClassName.name)`
2. 创建/删除操作用 `log` 级别
3. 危险/不可逆操作用 `warn` 级别
4. 捕获的第三方异常用 `error` 级别
5. 不记录密码、token、session secret

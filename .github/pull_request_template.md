## PR 自查清单

### 基础

- [ ] PR 标题遵循 Conventional Commits：`type(scope): 中文描述`
- [ ] 一个 PR 只做一件事（原子化）
- [ ] 代码已本地测试通过

### 代码质量

- [ ] `npx tsc --noEmit` 零错误
- [ ] `npm test` 单元测试全绿
- [ ] `npm run test:e2e` E2E 测试全绿
- [ ] 新增功能有对应测试
- [ ] 无 `console.log` / `debugger` 残留

### 安全

- [ ] 无硬编码密钥 / 密码
- [ ] 新增端点已加 `@AuthGuard` / `@Public()` 装饰器
- [ ] DTO 字段有 `@IsString()` / `@MaxLength()` 等校验
- [ ] 日志无敏感信息泄露
- [ ] SQL 无注入风险（使用 Prisma 参数化查询）

### 兼容性

- [ ] 不破坏前端已有接口契约
- [ ] 响应格式保持 `{code, msg, data}` 信封
- [ ] WebSocket 消息格式未变更（或已更新前端）
- [ ] SSE 事件名称未变更

### 文档

- [ ] 新增接口在 Swagger 中可见
- [ ] 有 session-log 记录
- [ ] 兼容风险已评估

### 数据库

- [ ] 数据库变更通过 Prisma migration（非手动 SQL）
- [ ] Migration 可向前兼容（无数据丢失）
- [ ] 已测试 `prisma migrate deploy` 成功

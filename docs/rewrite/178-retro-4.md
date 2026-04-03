# Retro-4：Phase E 复盘

> 覆盖范围：Step 145 – 180（Phase E 联调、质量与交付）

## 1. 成功点

### 1.1 全量回归体系
- 每一步执行后都有 typecheck + unit + e2e 三重验证
- 测试数从 Phase D 的 54 unit + 59 e2e 增长到 54 unit + 66 e2e（+7 upload e2e）
- 零回归失败逃逸到后续步骤

### 1.2 前后端兼容桥接
- apiClient 响应拦截器双模式（`ok===true || code===200`）一次搞定
- WebSocket 字段映射（`operation` ↔ `data`）在前端代理层透明处理
- WS URL 从路径参数到查询参数的切换，前端只改一行

### 1.3 限流与观测
- ThrottlerModule + 自定义 Guard（按 userId 或 IP），测试环境通过 mock ThrottlerStorage 完全旁路
- traceId 中间件 + 日志脱敏一步到位，无额外依赖

### 1.4 健康检查
- `/api/health` 合并 db/redis/minio 三方子系统状态
- degraded / down / ok 三级状态，适合接入监控告警

### 1.5 Docker 化
- 多阶段构建 Dockerfile（builder + runner），生产镜像精简
- compose.yml 一键启动全栈：postgres + redis + minio + backend + frontend

## 2. 失败点 / 踩坑

### 2.1 限流影响 E2E 测试
- **问题**：ThrottlerModule 注册 APP_GUARD 后，E2E 测试因限流返回 429
- **根因**：`overrideGuard()` 对 `APP_GUARD` 多提供者绑定无效
- **解决**：改用 `overrideProvider(ThrottlerStorage).useValue(...)` mock 存储层，使 `totalHits` 始终为 0
- **教训**：全局守卫的 E2E 绕过应以存储层 mock 为优先方案，而非 guard 层

### 2.2 PowerShell 编码问题
- **问题**：通过 PowerShell `Set-Content` 写入含中文的 .ts 文件导致 UTF-8 编码损坏
- **解决**：改用 `create_file` 工具写文件
- **教训**：Windows PowerShell 5.1 默认编码非 UTF-8，涉及中文必须用工具 API 而非 shell 命令

### 2.3 canvas.service.spec 遗漏
- **问题**：CanvasService 注入 MinioService 后，单元测试未更新 mock
- **根因**：新增 constructor 参数时未同步检查 spec 文件
- **解决**：补 `{ provide: MinioService, useValue: {} }` 即可
- **教训**：每次修改 constructor 都应立即运行对应 spec

## 3. 提示词优化记录

| 优化项 | 优化前 | 优化后 |
|--------|--------|--------|
| 限流测试绕过 | "在 E2E 中禁用限流" | "override ThrottlerStorage，返回 totalHits=0" |
| 文件写入 | "用 shell 写文件" | "涉及中文一律用 create_file 工具" |
| 构造函数变更 | "修改 constructor" | "修改 constructor + 立即检查 spec" |

## 4. 数据汇总

| 指标 | Phase D | Phase E | 变化 |
|------|---------|---------|------|
| 单元测试 | 54 | 54 | 不变 |
| E2E 测试 | 59 | 66 | +7 |
| 业务错误码 | 18 | 18 | 不变 |
| 新增文件 | - | ~25 | Dockerfile/compose/docs |
| 依赖包 | - | +4 | minio, multer, throttler, swagger |

## 5. 行动项

| # | 行动 | 状态 |
|---|------|------|
| 1 | 后续 constructor 变更后立即跑对应 spec | ✅ 已执行 |
| 2 | E2E fixtures 统一 mock ThrottlerStorage | ✅ 已实现 |
| 3 | 涉及中文的文件操作不用 PowerShell | ✅ 已约束 |

# Step 038 OpenSpec 总规格输出

状态：Draft-Ready（可进入 Step 039 Gate 审查）

## 1. 规格目标

本规格定义 ConnectionWise 迁移项目的可编码基线：

- 在兼容优先前提下，将旧系统迁移到 JS 全栈后端（NestJS + Prisma + PostgreSQL + Session/Redis + WS + SSE + MinIO + Docker）。
- 保持前端关键调用路径无需重写消费模型即可联调通过。
- 以红线与 ADR 作为硬约束，避免实现阶段漂移。

## 2. 输入与约束来源

核心输入：
- `docs/rewrite/28-api-diff-draft.md`
- `docs/rewrite/29-compat-redline-draft.md`
- `docs/rewrite/37-adr-decision-record.md`
- `docs/rewrite/10-be-inventory.md` 到 `docs/rewrite/27-fe-upload-fileflow-inventory.md`

硬约束：
- 必须满足 RL-01 到 RL-08。
- 必须遵循 ADR-001 到 ADR-007。
- 每一实现步都需可审计（会话日志 + 证据）。

## 3. 范围定义

### 3.1 In Scope

1. 认证与用户：注册、登录、登出、会话校验、用户搜索。
2. 画布与分享：Canvas CRUD、Share CRUD、owner/edit/view 权限。
3. 实时协作：WS 握手鉴权、消息分发、冲突回包。
4. AI 流式：SSE 三类入口与 close/error 语义。
5. 上传能力：缩略图上传与安全限制。
6. 交付：容器化、健康检查、回归脚本、发布文档。

### 3.2 Out of Scope（当前阶段）

1. 前端 UI 视觉重构。
2. 全量历史数据自动迁移脚本（仅定义目标模型与接口兼容）。
3. 跨云多活与高可用架构改造。

## 4. 目标架构规格

### 4.1 后端分层

- `Module`：按业务域拆分（Auth/User/Canvas/Share/Realtime/AI/Health）。
- `Controller`：协议与 DTO 边界。
- `Service`：业务编排与权限判定。
- `Repository/Prisma`：数据访问。
- `Common`：异常、拦截器、过滤器、守卫、装饰器。

### 4.2 基础设施

- 数据库：PostgreSQL。
- 会话：Redis + Session。
- 存储：MinIO（缩略图）。
- 协议：HTTP + WS + SSE。
- 部署：backend/frontend Dockerfile + compose。

## 5. 业务模块规格

### 5.1 Auth/User

必需接口：
- `POST /user/register`
- `POST /user/login`
- `POST /user/logout`
- `POST /user/check-auth`
- `GET /user/search`

行为要求：
- Session Cookie 可用，`withCredentials` 兼容。
- 守卫默认拦截，白名单只允许公开接口。

### 5.2 Canvas/Share

Canvas 必需接口（兼容集）：
- `POST /canvas/create/:userId`
- `GET /canvas/user/:userId`
- `GET /canvas/:id`
- `PUT /canvas`
- `DELETE /canvas/:canvasId`
- `GET /canvas/connection`
- `POST /canvas/uploadThumbnail`

Share 必需接口（兼容集）：
- `GET /share/user/:userId`
- `GET /share/:canvasId`
- `POST /share`
- `PUT /share`
- `DELETE /share/:shareId`

权限要求：
- owner/edit/view 语义一致。
- 禁止占位权限实现进入 Gate。

### 5.3 Realtime（WS）

连接要求：
- 路径与握手参数兼容旧前端。
- 握手阶段完成 session 鉴权与画布权限校验。

消息要求：
- 至少支持：`ping/pong`、`addNode`、`updateNode`、`deleteNode`、`addEdge`、`updateEdge`、`deleteEdge`。
- 冲突处理：`flushNode/flushEdge` 回包语义稳定。

### 5.4 AI（SSE）

必需接口：
- `GET /ai/generate`
- `GET /ai/associate`
- `GET /ai/generate-graph`
- `GET /ai/generate-graph-str`（非流式）

协议要求：
- `text/event-stream`。
- 事件语义保持 `push/close/error` 可识别。
- 超时、重试、熔断与降级策略可配置。

## 6. 数据模型规格（目标）

核心实体：
- `users`
- `canvases`
- `canvas_shares`

约束要求：
- users 的 username/email 唯一。
- canvases 保持 JSONB 节点/边结构。
- share 权限值必须受控（owner/edit/view）。

迁移要求：
- Prisma schema 是结构单一事实来源。
- migration 必须可重复执行且可回滚。

## 7. 错误与响应规格

- HTTP 统一响应包络。
- 统一异常过滤器。
- 兼容旧错误码可识别性。
- WS/SSE 也需统一错误语义映射。

## 8. 安全与合规规格

1. Session 安全：Cookie 参数、过期策略、跨域策略固定。
2. 权限安全：资源级权限判定必须在服务层可追踪。
3. AI 安全：输入防注入、输出过滤、配额限制。
4. 上传安全：文件类型/大小白名单、路径隔离。
5. 日志安全：敏感字段脱敏，支持 traceId/correlationId。

## 9. 兼容红线映射（执行门禁）

| 红线 | 规格落点 | Gate 判定 |
|---|---|---|
| RL-01 | Auth/User 接口与会话行为 | e2e + 联调通过 |
| RL-02 | 路径与前缀策略 | API 契约回归通过 |
| RL-03 | Canvas CRUD | 单测 + e2e 通过 |
| RL-04 | Share 权限 | 权限测试矩阵通过 |
| RL-05 | WS 协议 | 双客户端契约通过 |
| RL-06 | SSE 协议 | 流式契约测试通过 |
| RL-07 | 上传能力 | 上传 e2e 通过 |
| RL-08 | Session/Redis | 登录态回归通过 |

## 10. 测试规格

分层策略：
- 单测：Service/Guard/Policy 核心分支。
- e2e：用户、画布、分享、上传主链路。
- 协议契约：WS 与 SSE 独立回归脚本。

最小通过门槛：
1. 红线相关用例 100% 通过。
2. 关键接口无 P1 回归。
3. 契约测试无破坏性变更。

## 11. 可观测性与运维规格

1. 健康检查：`GET /health` 覆盖 app/db/redis/minio。
2. 结构化日志：按模块输出，含 trace 标识。
3. 回归入口：`lint -> test -> e2e -> ws -> sse`。

## 12. 交付物清单（供 Phase B-E 使用）

1. 可运行 backend-nest 工程骨架。
2. Prisma schema 与迁移脚本。
3. Auth/User/Canvas/Share/Realtime/AI 模块实现。
4. 测试与契约脚本。
5. Dockerfile、compose、部署与回滚文档。

## 13. 决策冻结与变更机制

1. 本规格默认冻结，任何变更必须引用 ADR 修订记录。
2. 变更同时更新红线影响分析与 Gate 结论。
3. 未更新规格的实现改动视为违规，不得进入下一 Gate。

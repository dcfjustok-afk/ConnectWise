# Step 037 ADR 决策文档固化

目标：将 Phase A 已达成的关键技术决策以 ADR 形式固化，形成后续编码阶段的不可漂移基线。

来源输入：
- `docs/rewrite/29-compat-redline-draft.md`
- `docs/rewrite/30-techstack-qa-q1-framework.md`
- `docs/rewrite/31-techstack-qa-q2-orm-db.md`
- `docs/rewrite/32-techstack-qa-q3-session-redis.md`
- `docs/rewrite/33-techstack-qa-q4-realtime.md`
- `docs/rewrite/34-techstack-qa-q5-ai-provider.md`
- `docs/rewrite/35-techstack-qa-q6-deploy-container.md`
- `docs/rewrite/36-techstack-qa-q7-test-strategy.md`

---

## ADR-001：后端框架选型

- 状态：Accepted
- 决策：采用 NestJS（TypeScript）作为后端框架。
- 背景：迁移目标为 JS 全栈，且需模块化、可测试、可治理。
- 影响：后续所有模块按 Nest Module/Controller/Service 组织。
- 备选与拒绝原因：
  - Express：工程约束弱，治理成本高。
  - Spring Boot：与全栈 JS 目标不一致，迁移成本更高。

## ADR-002：ORM 与数据库

- 状态：Accepted
- 决策：采用 PostgreSQL + Prisma。
- 背景：旧系统已使用 PostgreSQL，且存在 JSONB 场景。
- 影响：以 Prisma schema/migration 作为结构单一事实来源。
- 备选与拒绝原因：
  - TypeORM：迁移路径可行但与既定计划不一致。
  - MySQL：与历史数据结构和 JSONB 能力不匹配。

## ADR-003：认证与会话

- 状态：Accepted
- 决策：采用 Session + Redis（Cookie 会话）模型。
- 背景：前端已使用 `withCredentials`，旧系统为 Session 模式。
- 影响：保留 `check-auth` 语义与会话型守卫链路。
- 备选与拒绝原因：
  - JWT：会改变既有客户端认证行为，兼容风险高。
  - DB Session：性能与运维弹性不如 Redis。

## ADR-004：实时层协议

- 状态：Accepted
- 决策：协作使用 WebSocket，AI 流式使用 SSE。
- 背景：旧系统和前端现状均为 WS + SSE 双通道。
- 影响：需分别维护 WS 契约与 SSE 契约测试。
- 备选与拒绝原因：
  - 全量 WS：AI 流式复杂度与客户端改造成本上升。
  - 轮询：实时性不足，不满足协作场景。

## ADR-005：AI Provider 架构

- 状态：Accepted
- 决策：采用 Provider 抽象接口 + 工厂切换（主备/降级）。
- 背景：需要控制供应商波动、超时、成本与可用性风险。
- 影响：业务层只依赖统一接口，不直接绑定厂商 SDK。
- 备选与拒绝原因：
  - 单 Provider 直连：供应商故障时缺乏兜底。
  - 完全自建模型：当前阶段投入与风险不匹配。

## ADR-006：部署与容器化

- 状态：Accepted
- 决策：后端/前端分别 Dockerfile，使用 compose 进行本地联调编排。
- 背景：需要环境一致性与联调可复制性。
- 影响：Phase E 必须产出镜像构建与 compose 验证证据。
- 备选与拒绝原因：
  - 仅后端容器化：联调环境不一致问题依旧。
  - 直接上 K8s：超出当前阶段目标与复杂度预算。

## ADR-007：测试策略

- 状态：Accepted
- 决策：采用 单测 + e2e + 协议契约（WS/SSE）分层测试。
- 背景：迁移风险来自逻辑、流程、协议三层。
- 影响：后续必须建设多层测试入口，而非单一冒烟。
- 备选与拒绝原因：
  - 仅 e2e：定位慢，故障归因困难。
  - 仅单测：无法覆盖真实链路与协议兼容。

---

## 与兼容红线绑定关系

| 红线 | 对应 ADR |
|---|---|
| RL-01/RL-08（认证会话） | ADR-003 |
| RL-02（路径兼容） | ADR-001, ADR-006 |
| RL-03/RL-04（业务与权限） | ADR-001, ADR-002, ADR-007 |
| RL-05/RL-06（WS/SSE） | ADR-004, ADR-007 |
| RL-07（上传） | ADR-001, ADR-006, ADR-007 |

## 变更控制规则

1. 任一 ADR 变更必须新增修订记录，不允许静默覆盖。
2. ADR 变更需要同时评估红线影响并更新 Gate 结论。
3. Step 038 OpenSpec 必须引用本文件作为决策输入。

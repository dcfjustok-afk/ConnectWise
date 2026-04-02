# ConnectionWise AI Playbook v2（Clean-Room 全程 AI 执行版）

> 目标：对 `D:\project\connection-wise_BE` 与 `D:\project\connection-wise-FE` 做完整调研后，按兼容优先策略重构为 JS 全栈（NestJS + Prisma + PostgreSQL + Session/Redis + WS + SSE + MinIO + Docker）。
>
> 本文档是“执行手册”，不是说明文。每一步必须由 AI 执行，人工只负责：决策、确认、验收。

---

## 0. 先决规则（必须遵守）

1. 只执行当前 Step，禁止跨步。
2. 每步都要产出证据：AI 输出、改动文件、命令结果、风险。
3. 每步都要包含 8 个字段：
   - `AI角色`
   - `AI工具`
   - `MCP`
   - `输入提示词`
   - `AI Coding参与点`
   - `执行命令`
   - `验收标准`
   - `失败最小修复`
4. 每步失败只修当前步，不扩散。
5. 每步通过后，必须写入 `docs/rewrite/00-session-log.md`。
6. 每 10 步做一次复盘（Retro）。
7. 所有“历史已执行记录”一律清空后再开始。

---

## 1. AI 执行栈（固定）

### 1.1 AI角色字典

- `Explore`：代码扫描、行为盘点、影响面分析
- `Spec`：SDD/OpenSpec 规格收敛与契约定义
- `Code`：实现、重构、脚本、迁移
- `Test`：单测/e2e/契约测试/压测
- `Review`：回归风险、安全风险、兼容风险审查
- `Retro`：复盘、提示词优化、流程优化

### 1.2 AI工具字典（每步至少 1 个）

- `Copilot Chat`：主执行器（对话式步骤执行）
- `Copilot Edit`：多文件改动与批量修复
- `Copilot Agent(Explore)`：代码库深度探索
- `SDD/OpenSpec`：规格文件驱动开发
- `Skills`：专项最佳实践（API、Auth、Playwright、Postgres、Vercel）
- `GSD`：任务图谱、原子步骤编排、阶段门禁

### 1.3 MCP字典

- `FS`：文件读写
- `GIT`：差异与快照
- `HTTP`：接口联调与抓包
- `DB`：迁移验证与数据检查
- `LOG`：日志与异常定位
- `GH`：PR/Issue（可选）

---

## 2. Clean-Room 启动阶段（Step 000-009）

### Step 000 清理旧执行痕迹
- AI角色：Review
- AI工具：Copilot Edit
- MCP：FS
- 输入提示词：`删除 docs/rewrite 下所有历史执行产物，仅保留空目录。`
- AI Coding参与点：AI 执行文件删除并输出删除清单。
- 执行命令：`(无)`
- 验收标准：`docs/rewrite` 不存在旧记录文件。
- 失败最小修复：仅补删漏文件，不改其他目录。

### Step 001 初始化会话日志模板
- AI角色：Spec
- AI工具：SDD/OpenSpec
- MCP：FS
- 输入提示词：`创建 docs/rewrite/00-session-log.md，包含 8 字段模板与证据区块。`
- AI Coding参与点：AI 生成可复制模板。
- 执行命令：`(无)`
- 验收标准：模板可直接记录 Step 002 及以后步骤。
- 失败最小修复：只补缺失字段。

### Step 002 初始化 AI 提示词模板库
- AI角色：Spec
- AI工具：Skills + GSD
- MCP：FS
- 输入提示词：`创建 docs/rewrite/01-prompt-templates.md，分 Explore/Spec/Code/Test/Review/Retro 六类，每类 >= 8 条。`
- AI Coding参与点：AI 生成可复用提示词库。
- 执行命令：`(无)`
- 验收标准：每条提示词包含输入、输出、禁区、验收。
- 失败最小修复：补足数量与结构。

### Step 003 初始化步骤门禁规则
- AI角色：Spec
- AI工具：GSD
- MCP：FS
- 输入提示词：`创建 docs/rewrite/02-gate-rules.md，定义每步通过/阻断/回滚判定。`
- AI Coding参与点：AI 生成 Gate 规则与阻断清单。
- 执行命令：`(无)`
- 验收标准：有明确 Gate-1 到 Gate-5。
- 失败最小修复：补判定矩阵。

### Step 004 初始化证据留存规范
- AI角色：Review
- AI工具：Copilot Chat
- MCP：FS
- 输入提示词：`创建 docs/rewrite/03-evidence-policy.md，定义命令输出、截图、日志、diff 的留存要求。`
- AI Coding参与点：AI 生成证据模板。
- 执行命令：`(无)`
- 验收标准：每步都能按模板记录证据。
- 失败最小修复：补字段与示例。

### Step 005 初始化 AI 使用策略
- AI角色：Spec
- AI工具：Skills
- MCP：FS
- 输入提示词：`创建 docs/rewrite/04-ai-coding-strategy.md，说明何时用 Chat/Edit/Agent/Skill/OpenSpec。`
- AI Coding参与点：AI 给出工具选择决策树。
- 执行命令：`(无)`
- 验收标准：有“场景->工具->输出物”表格。
- 失败最小修复：补决策树。

### Step 006 初始化风险分类规范
- AI角色：Review
- AI工具：Copilot Chat
- MCP：FS
- 输入提示词：`创建 docs/rewrite/05-risk-taxonomy.md，定义兼容/安全/性能/进度四类风险。`
- AI Coding参与点：AI 生成风险分级与应对。
- 执行命令：`(无)`
- 验收标准：每类风险有触发条件与止损动作。
- 失败最小修复：补止损动作。

### Step 007 初始化回滚策略模板
- AI角色：Retro
- AI工具：GSD
- MCP：FS
- 输入提示词：`创建 docs/rewrite/06-rollback-template.md，按 API/DB/Config 三层定义回滚。`
- AI Coding参与点：AI 生成可执行回滚步骤。
- 执行命令：`(无)`
- 验收标准：模板可直接套用。
- 失败最小修复：补 DB 一致性检查项。

### Step 008 初始化复盘模板
- AI角色：Retro
- AI工具：Copilot Chat
- MCP：FS
- 输入提示词：`创建 docs/rewrite/07-retro-template.md，含成功点/失败点/提示词优化。`
- AI Coding参与点：AI 生成复盘问卷。
- 执行命令：`(无)`
- 验收标准：模板可每 10 步复用。
- 失败最小修复：补行动项字段。

### Step 009 启动门禁确认
- AI角色：Review
- AI工具：Copilot Agent(Explore)
- MCP：FS
- 输入提示词：`检查 Step 000-008 产物完整性，输出启动检查报告 docs/rewrite/08-kickoff-check.md。`
- AI Coding参与点：AI 自动对照检查并标红缺失项。
- 执行命令：`(无)`
- 验收标准：报告显示可进入 Phase A。
- 失败最小修复：只补缺项。

---

## 3. Phase A 发现与问答决策（Step 010-039）

### 执行目标

- AI 全量遍历旧后端与旧前端代码。
- 输出 as-is 全景文档。
- 通过问答 Gate 确认后端技术栈。
- 形成可编码规格（OpenSpec）。

### Step 列表（每步均按 8 字段执行）

- Step 010：后端目录与入口盘点
- Step 011：后端模块职责盘点
- Step 012：后端配置与环境变量盘点
- Step 013：后端 API 清单提取
- Step 014：后端错误码与异常流盘点
- Step 015：后端 WS 协议盘点
- Step 016：后端 SSE 协议盘点
- Step 017：后端 DB 表结构盘点
- Step 018：后端 SQL/事务模式盘点
- Step 019：后端鉴权与权限盘点
- Step 020：前端目录结构盘点
- Step 021：前端页面路由盘点
- Step 022：前端状态管理盘点
- Step 023：前端 API 调用点盘点
- Step 024：前端 WS 消费点盘点
- Step 025：前端 SSE 消费点盘点
- Step 026：前端鉴权状态流盘点
- Step 027：前端上传与文件流程盘点
- Step 028：前后端接口差异初稿
- Step 029：兼容红线初稿
- Step 030：技术栈问答 Q1（框架）
- Step 031：技术栈问答 Q2（ORM/DB）
- Step 032：技术栈问答 Q3（Session/Redis）
- Step 033：技术栈问答 Q4（实时层 WS/SSE）
- Step 034：技术栈问答 Q5（AI Provider）
- Step 035：技术栈问答 Q6（部署/容器）
- Step 036：技术栈问答 Q7（测试策略）
- Step 037：ADR 决策文档固化
- Step 038：OpenSpec 总规格输出
- Step 039：Phase A Gate（允许进入编码）

---

## 4. Phase B 基线工程与认证系统（Step 040-074）

### 执行目标

- 搭建 Nest + Prisma 基线工程。
- 完成统一响应与异常体系。
- 完成 Session + Redis 认证链路。
- 完成 user/auth 兼容接口。

### Step 列表

- Step 040：初始化 backend-nest clean skeleton
- Step 041：引入配置模块（app/db/redis/session/minio/ai）
- Step 042：初始化 Prisma 与 schema
- Step 043：生成首个 migration
- Step 044：注册全局响应拦截器
- Step 045：注册全局异常过滤器
- Step 046：定义业务异常基类与错误码
- Step 047：接入 session 中间件
- Step 048：接入 connect-redis
- Step 049：CORS + withCredentials 验证
- Step 050：Auth 模块骨架
- Step 051：User 模块骨架
- Step 052：POST /user/register
- Step 053：POST /user/login
- Step 054：POST /user/logout
- Step 055：POST /user/check-auth
- Step 056：GET /user/search
- Step 057：AuthGuard
- Step 058：Public 装饰器
- Step 059：CurrentUser 装饰器
- Step 060：Auth Service 单测
- Step 061：Auth Guard 单测
- Step 062：User Service 单测
- Step 063：Auth e2e（register/login/logout/check-auth）
- Step 064：User e2e（search）
- Step 065：Phase B Review（兼容）
- Step 066：Phase B Review（安全）
- Step 067：Phase B Review（性能）
- Step 068：Phase B 风险收敛
- Step 069：Retro-1
- Step 070：Prompt 优化-1
- Step 071：脚手架模板固化
- Step 072：错误码映射二次校准
- Step 073：日志模板固化
- Step 074：Phase B Gate

---

## 5. Phase C Canvas/Share 业务迁移（Step 075-109）

### 执行目标

- 完成 Canvas 与 Share 全量迁移。
- 收敛 owner/edit/view 权限策略。
- 完成单测与 e2e 覆盖。

### Step 列表

- Step 075：Canvas 模块骨架
- Step 076：Canvas Repository 分层
- Step 077：POST /canvas/create/:userId
- Step 078：GET /canvas/user/:userId
- Step 079：GET /canvas/:id
- Step 080：PUT /canvas
- Step 081：DELETE /canvas/:canvasId
- Step 082：GET /canvas/connection
- Step 083：Canvas DTO 校验补齐
- Step 084：Canvas 单测-创建
- Step 085：Canvas 单测-读取
- Step 086：Canvas 单测-更新
- Step 087：Canvas 单测-删除
- Step 088：Canvas 单测-权限边界
- Step 089：Canvas e2e 全流程
- Step 090：Share 模块骨架
- Step 091：GET /share/user/:userId
- Step 092：GET /share/:canvasId
- Step 093：POST /share
- Step 094：PUT /share
- Step 095：DELETE /share/:shareId
- Step 096：Share DTO 校验补齐
- Step 097：Share 单测-owner 限制
- Step 098：Share 单测-重复分 享
- Step 099：Share e2e 全流程
- Step 100：权限 Policy 层收敛
- Step 101：权限矩阵文档生成
- Step 102：Phase C Review（兼容）
- Step 103：Phase C Review（安全）
- Step 104：Phase C 风险收敛
- Step 105：Retro-2
- Step 106：Prompt 优化-2
- Step 107：契约回归脚本补齐
- Step 108：测试数据夹具固化
- Step 109：Phase C Gate

---

## 6. Phase D 实时与 AI 能力（Step 110-144）

### 执行目标

- 完成 WS 协议与冲突回包。
- 完成 AI SSE 接口与降级策略。
- 构建实时与流式契约测试。

### Step 列表

- Step 110：Realtime 模块骨架
- Step 111：WS 路径与适配器初始化
- Step 112：WS 握手 session 鉴权
- Step 113：WS 画布权限校验
- Step 114：ping/pong
- Step 115：addNode
- Step 116：deleteNode
- Step 117：updateNode + version
- Step 118：flushNode 回包
- Step 119：addEdge
- Step 120：deleteEdge
- Step 121：updateEdge + version
- Step 122：flushEdge 回包
- Step 123：WS 异常回包统一
- Step 124：WS 双客户端契约脚本
- Step 125：AI 模块骨架
- Step 126：AI Provider 抽象接口
- Step 127：Provider 工厂与配置切换
- Step 128：GET /ai/generate（SSE）
- Step 129：GET /ai/associate（SSE）
- Step 130：GET /ai/generate-graph（SSE）
- Step 131：GET /ai/generate-graph-str
- Step 132：SSE close/error 统一处理
- Step 133：SSE 契约测试脚本
- Step 134：AI 超时与重试策略
- Step 135：AI 熔断与降级兜底
- Step 136：AI 成本与配额策略
- Step 137：AI 安全（注入防护/输出过滤）
- Step 138：Phase D Review（兼容）
- Step 139：Phase D Review（稳定性）
- Step 140：Phase D 风险收敛
- Step 141：Retro-3
- Step 142：Prompt 优化-3
- Step 143：契约与回归入口汇总
- Step 144：Phase D Gate

---

## 7. Phase E 联调、质量与交付（Step 145-180）

### 执行目标

- 前端切新后端地址并完成联调。
- 完成上传、健康检查、观测与限流。
- 完成交付材料与发布规范。

### Step 列表

- Step 145：MinIOService
- Step 146：POST /canvas/uploadThumbnail
- Step 147：上传大小/类型/安全限制
- Step 148：上传 e2e
- Step 149：前端 API_BASE_URL 切换
- Step 150：前端 WS_BASE_URL 切换
- Step 151：登录联调修复
- Step 152：首页列表联调修复
- Step 153：编辑页初始化联调
- Step 154：前端 WS 协议联调
- Step 155：前端 Share 联调
- Step 156：前端 SSE 联调
- Step 157：缩略图上传联调
- Step 158：DTO 校验总审计
- Step 159：登录/AI 限流
- Step 160：日志脱敏
- Step 161：traceId/correlationId
- Step 162：GET /health（app/db/redis/minio）
- Step 163：Swagger 接入
- Step 164：导出 openapi json
- Step 165：联调检查清单
- Step 166：回归脚本入口（lint->test->e2e->ws->sse）
- Step 167：backend Dockerfile
- Step 168：frontend Dockerfile
- Step 169：infra compose.yml
- Step 170：本地容器联调验证
- Step 171：部署文档
- Step 172：回滚文档
- Step 173：Go-Live 清单
- Step 174：PR checklist 模板
- Step 175：兼容风险模板
- Step 176：抓包对照模板
- Step 177：错误码冲突检查清单
- Step 178：Retro-4
- Step 179：Prompt Library 最终版
- Step 180：Final Migration Report

---

## 8. 每一步统一执行提示词（复制即用）

```text
请执行 Step {{step_no}}，严格遵守：
1) 只做当前步骤，不跨步；
2) 输出 8 字段：AI角色、AI工具、MCP、输入提示词、AI Coding参与点、执行命令、验收标准、失败最小修复；
3) 若失败，仅修复当前步骤并给最小补丁；
4) 输出改动文件与关键命令结果；
5) 把本步记录写入 docs/rewrite/00-session-log.md。
```

---

## 9. AI Coding 使用准则（真正“体验 AI”）

1. Explore 阶段：优先用 `Copilot Agent(Explore)` 做代码基线扫描，不靠人工读目录。
2. Spec 阶段：所有契约先写 OpenSpec，再开始编码。
3. Code 阶段：先让 AI 产最小可运行骨架，再逐步补行为与校验。
4. Test 阶段：每个功能先要“失败用例”，再写实现。
5. Review 阶段：每 10 步固定做兼容/安全/性能审查。
6. Retro 阶段：每次复盘都要回写“提示词改进前后差异”。

---

## 10. 清空历史执行说明

- 本轮 Playbook 以 Clean-Room 方式重启。
- 旧执行日志、旧阶段产物、旧临时文档不作为有效进度。
- 从 Step 000 重新计数，确保全程 AI 可追溯。

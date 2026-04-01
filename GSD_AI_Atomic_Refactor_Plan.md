# ConnectionWise 重构原子化 Plan（GSD / Get Shit Done）

> 目标：将 `connection-wise_BE(Java)` 与 `connection-wise-FE` 重构为 **JS 全栈**（NestJS + Prisma + PostgreSQL + Session/Redis + 原生 WebSocket + SSE + MinIO + Docker Compose）。
>
> 约束：每一步都是原子动作；每一步都有可直接复制的 AI 提示词；一步一验收。

## 执行规则（固定）

1. 一次只做 1 个步骤，不能并行改多个目标。
2. 每个步骤完成后必须有可见产物（代码/文档/脚本/测试结果）。
3. 每个步骤失败时，只允许修这个步骤，不允许跳步。
4. 每个步骤通过后立即提交（本地 commit 或至少变更快照）。
5. 提示词默认发给你的编码 Agent（OpenCode/Copilot/Cursor/Claude Code 均可）。

---

## 原子步骤清单（无 Phase，纯原子）

### Step 001
**动作**：创建重构总目录结构草案文档。  
**产物**：`docs/rewrite/00-folder-structure.md`  
**提示词**：
```text
请为以下项目生成重构目录结构文档，输出到 docs/rewrite/00-folder-structure.md：
- backend-nest
- frontend-web
- infra
- docs/rewrite
要求：只给最终目录树和每个目录一句职责说明，不要写实现代码。
```

### Step 002
**动作**：创建 API 兼容红线文档。  
**产物**：`docs/rewrite/01-api-compat-rules.md`  
**提示词**：
```text
请创建 docs/rewrite/01-api-compat-rules.md，列出新后端必须兼容旧前端的规则：
1) 响应 envelope 字段
2) 401 行为
3) cookie/session 行为
4) 错误码语义
5) 路由前缀与路径
每条规则给“必须/可选/禁止”标签。
```

### Step 003
**动作**：创建 WebSocket 协议规范文档。  
**产物**：`docs/rewrite/02-ws-contract.md`  
**提示词**：
```text
请创建 docs/rewrite/02-ws-contract.md，定义前后端 WS 协议：
- 消息总结构 { type, operation }
- type 列表：ping/pong/addNode/deleteNode/updateNode/addEdge/deleteEdge/updateEdge/flushNode/flushEdge
- operation 字段定义与示例
- 错误场景与回包规范
输出必须是可直接给前后端联调的契约文档。
```

### Step 004
**动作**：创建 SSE 协议规范文档。  
**产物**：`docs/rewrite/03-sse-contract.md`  
**提示词**：
```text
请创建 docs/rewrite/03-sse-contract.md，定义 AI SSE 契约：
- endpoint 列表
- event 名称（push/close/error）
- data 结构
- 连接关闭与异常处理
要求：保留现有前端 EventSource 可直接消费的格式。
```

### Step 005
**动作**：创建数据库迁移映射文档（旧表到 Prisma）。  
**产物**：`docs/rewrite/04-db-mapping.md`  
**提示词**：
```text
请创建 docs/rewrite/04-db-mapping.md，内容包括：
- users/canvases/canvas_shares 从旧 SQL 到 Prisma 的字段映射
- 主键/唯一索引/外键/默认值
- JSONB 字段策略
输出表格形式，不要生成代码。
```

### Step 006
**动作**：创建错误码映射文档。  
**产物**：`docs/rewrite/05-error-code-map.md`  
**提示词**：
```text
请创建 docs/rewrite/05-error-code-map.md，给出：
- 旧系统错误码
- 新系统对应错误类
- HTTP 状态码
- 前端展示建议（toast/redirect/retry）
```

### Step 007
**动作**：初始化 NestJS 项目。  
**产物**：`backend-nest` 可运行基础工程  
**提示词**：
```text
请在 backend-nest 初始化 NestJS 项目（TypeScript），仅保留最小可运行结构。
要求：
- 能 npm run start:dev 启动
- 输出文件树
- 不要接业务代码
```

### Step 008
**动作**：安装并配置 Prisma。  
**产物**：`backend-nest/prisma/schema.prisma` 初版  
**提示词**：
```text
请在 backend-nest 集成 Prisma，并创建 schema.prisma 初版：
- User
- Canvas
- CanvasShare
要求字段名与旧系统语义一致，先不写业务 service。
```

### Step 009
**动作**：创建首个 Prisma migration。  
**产物**：`backend-nest/prisma/migrations/*`  
**提示词**：
```text
请基于当前 schema.prisma 生成首个 migration，并给出执行命令与预期结果。
只做 migration，不改业务代码。
```

### Step 010
**动作**：配置 Nest 全局响应拦截器（envelope）。  
**产物**：统一响应格式代码  
**提示词**：
```text
请实现 Nest 全局响应拦截器，所有成功响应统一为：
{ ok: true, code: 0, msg: "success", data: ... }
并给出文件路径与注册位置。
```

### Step 011
**动作**：配置 Nest 全局异常过滤器。  
**产物**：统一错误格式代码  
**提示词**：
```text
请实现 Nest 全局异常过滤器，错误统一为：
{ ok: false, code, msg, data: null }
并支持自定义业务异常到错误码映射。
```

### Step 012
**动作**：接入 `express-session` + Redis 存储。  
**产物**：Session 中间件配置  
**提示词**：
```text
请在 Nest 项目集成 Session + Redis：
- express-session
- connect-redis
- cookie 名称与旧系统兼容
- withCredentials 可用
仅完成中间件装配与配置读取。
```

### Step 013
**动作**：创建 Auth 模块骨架（controller/service/dto）。  
**产物**：`auth` 模块文件  
**提示词**：
```text
请创建 auth 模块骨架：
- auth.controller.ts
- auth.service.ts
- dto/login.dto.ts
- dto/register.dto.ts
只创建结构与类型，不填业务逻辑。
```

### Step 014
**动作**：实现 `POST /user/login`。  
**产物**：可登录并写入 session  
**提示词**：
```text
请实现 POST /user/login：
- 校验用户名密码
- 成功后写入 session.user
- 返回 envelope
要求：接口路径与旧前端调用一致。
```

### Step 015
**动作**：实现 `POST /user/logout`。  
**产物**：登出销毁 session  
**提示词**：
```text
请实现 POST /user/logout：
- 销毁 session
- 清理 cookie
- 返回统一 envelope
```

### Step 016
**动作**：实现 `POST /user/check-auth`。  
**产物**：返回当前 session 用户  
**提示词**：
```text
请实现 POST /user/check-auth：
- 未登录返回 401 + 统一错误 envelope
- 已登录返回 user 简要信息
```

### Step 017
**动作**：实现 `POST /user/register`。  
**产物**：注册可用  
**提示词**：
```text
请实现 POST /user/register：
- 校验用户名/邮箱唯一性
- 密码使用 bcrypt 哈希
- 返回统一 envelope
```

### Step 018
**动作**：实现 `GET /user/search`。  
**产物**：按用户名搜索可用  
**提示词**：
```text
请实现 GET /user/search?username=xxx：
- 需要登录
- 返回用户基础信息列表或单个结果（按旧前端需求）
```

### Step 019
**动作**：创建 Auth Guard（HTTP）。  
**产物**：受保护路由可统一鉴权  
**提示词**：
```text
请实现基于 session 的 AuthGuard：
- 有 session.user 放行
- 无 session.user 抛 401
- 可通过装饰器声明白名单路由
```

### Step 020
**动作**：创建 Canvas 模块骨架。  
**产物**：`canvas` 模块文件  
**提示词**：
```text
请创建 canvas 模块骨架：controller/service/dto/repository。
只建文件与类型，不写业务逻辑。
```

### Step 021
**动作**：实现 `POST /canvas/create/:userId`。  
**产物**：创建画布可用  
**提示词**：
```text
请实现 POST /canvas/create/:userId：
- 校验 session.user.id 与 path userId 一致
- 创建默认 canvas（含默认 nodes/edges）
- 返回统一 envelope
```

### Step 022
**动作**：实现 `GET /canvas/user/:userId`。  
**产物**：我的画布列表可用  
**提示词**：
```text
请实现 GET /canvas/user/:userId：
- 校验登录与 userId 权限
- 返回该用户拥有的画布列表
```

### Step 023
**动作**：实现 `GET /canvas/:id`。  
**产物**：画布详情可用  
**提示词**：
```text
请实现 GET /canvas/:id：
- owner 或 share 用户可访问
- 返回 canvas + permission
```

### Step 024
**动作**：实现 `PUT /canvas`。  
**产物**：画布更新可用  
**提示词**：
```text
请实现 PUT /canvas：
- 仅 owner 或 edit 权限可更新
- 支持 title/description/settings 等字段
```

### Step 025
**动作**：实现 `DELETE /canvas/:canvasId`。  
**产物**：删除画布可用  
**提示词**：
```text
请实现 DELETE /canvas/:canvasId：
- 仅 owner 可删除
- 同时清理关联 share 记录
```

### Step 026
**动作**：创建 Share 模块骨架。  
**产物**：`share` 模块文件  
**提示词**：
```text
请创建 share 模块骨架：controller/service/dto。
仅创建结构。
```

### Step 027
**动作**：实现 `GET /share/user/:userId`。  
**产物**：共享给我的画布列表可用  
**提示词**：
```text
请实现 GET /share/user/:userId：
- 仅允许本人查询
- 返回被分享画布列表
```

### Step 028
**动作**：实现 `GET /share/:canvasId`。  
**产物**：画布分享成员列表可用  
**提示词**：
```text
请实现 GET /share/:canvasId：
- 仅 owner 可查询成员详情
- 返回 shareId/userId/username/permission
```

### Step 029
**动作**：实现 `POST /share`。  
**产物**：新增分享可用  
**提示词**：
```text
请实现 POST /share：
- 入参：canvasId/userName/permission
- 仅 owner 可添加
- 禁止重复分享
```

### Step 030
**动作**：实现 `PUT /share`。  
**产物**：修改分享权限可用  
**提示词**：
```text
请实现 PUT /share：
- 入参：canvasId/userId/permission
- 仅 owner 可改
```

### Step 031
**动作**：实现 `DELETE /share/:shareId`。  
**产物**：删除分享可用  
**提示词**：
```text
请实现 DELETE /share/:shareId：
- 仅 owner 可删
- 删除后返回统一 envelope
```

### Step 032
**动作**：实现 `GET /canvas/connection`。  
**产物**：连接准入检查可用  
**提示词**：
```text
请实现 GET /canvas/connection?canvasId=xxx：
- 检查是否有该画布访问权限
- 检查全局连接上限与房间连接上限
- 按旧前端可识别错误码返回
```

### Step 033
**动作**：创建 WebSocket 网关骨架（原生 ws）。  
**产物**：`realtime` 模块基础可启动  
**提示词**：
```text
请在 Nest 中创建原生 WebSocket 网关骨架：
- 路径 /api/ws/canvas/:canvasId
- 连接/断开生命周期
- 会话上下文挂载 userId/canvasId
```

### Step 034
**动作**：实现 WS 握手鉴权。  
**产物**：无 session 不可连  
**提示词**：
```text
请实现 WS 握手鉴权：
- 从 cookie 解析 session
- 校验用户对 canvas 的访问权限
- 失败返回可诊断错误码
```

### Step 035
**动作**：实现 `ping -> pong`。  
**产物**：心跳可用  
**提示词**：
```text
请在 WS 消息处理器中实现 ping/pong：
- 收到 type=ping 返回 type=pong
- 不触发持久化
```

### Step 036
**动作**：实现 WS `addNode`。  
**产物**：新增节点持久化 + 广播可用  
**提示词**：
```text
请实现 WS type=addNode：
- operation.id/value
- 写入数据库 JSONB
- 广播到同 canvas 连接
```

### Step 037
**动作**：实现 WS `deleteNode`。  
**产物**：删除节点持久化 + 广播可用  
**提示词**：
```text
请实现 WS type=deleteNode：
- operation.id
- 从 JSONB 数组删除
- 广播给房间
```

### Step 038
**动作**：实现 WS `updateNode` + 版本检查。  
**产物**：节点更新与冲突处理可用  
**提示词**：
```text
请实现 WS type=updateNode：
- operation.id/path/value/version
- 版本一致则更新并递增 version
- 版本冲突返回 flushNode（服务端权威数据）
```

### Step 039
**动作**：实现 WS `addEdge`。  
**产物**：新增边可用  
**提示词**：
```text
请实现 WS type=addEdge：
- 持久化 edge 到 JSONB
- 广播消息
```

### Step 040
**动作**：实现 WS `deleteEdge`。  
**产物**：删除边可用  
**提示词**：
```text
请实现 WS type=deleteEdge：
- 从 JSONB 删除指定 edge
- 广播消息
```

### Step 041
**动作**：实现 WS `updateEdge` + 版本检查。  
**产物**：边更新与冲突处理可用  
**提示词**：
```text
请实现 WS type=updateEdge：
- operation.id/path/value/version
- 冲突时回 flushEdge
```

### Step 042
**动作**：接入 MinIO 客户端配置。  
**产物**：MinIOService 可注入使用  
**提示词**：
```text
请创建 MinIOService：
- 从配置读取 endpoint/accessKey/secretKey/bucket
- 提供 upload/delete/getPublicUrl 方法签名
先不写 controller。
```

### Step 043
**动作**：实现 `POST /canvas/uploadThumbnail`。  
**产物**：缩略图上传可用  
**提示词**：
```text
请实现 POST /canvas/uploadThumbnail（multipart）：
- 入参 canvasId + thumbnail
- 权限检查
- 上传 MinIO 并更新 canvas 记录
```

### Step 044
**动作**：创建 AI 模块骨架。  
**产物**：`ai` 模块文件  
**提示词**：
```text
请创建 ai 模块骨架：controller/service/provider。
仅创建结构与接口定义。
```

### Step 045
**动作**：实现 `GET /ai/generate` SSE。  
**产物**：AI 生成流可用  
**提示词**：
```text
请实现 GET /ai/generate SSE：
- event: push 持续输出
- event: close 正常结束
- event: error 异常结束
```

### Step 046
**动作**：实现 `GET /ai/associate` SSE。  
**产物**：联想流可用  
**提示词**：
```text
请实现 GET /ai/associate SSE：
- 输入 prompt
- 以 push 流式返回文本
- close 收尾
```

### Step 047
**动作**：实现 `GET /ai/generate-graph` SSE。  
**产物**：图谱生成流可用  
**提示词**：
```text
请实现 GET /ai/generate-graph SSE：
- 输出结构化图数据文本流
- 结束时发送 close
```

### Step 048
**动作**：实现 `GET /ai/generate-graph-str`。  
**产物**：一次性字符串生成可用  
**提示词**：
```text
请实现 GET /ai/generate-graph-str：
- 输入 prompt
- 返回单次字符串结果
- 保持旧前端解析兼容
```

### Step 049
**动作**：添加后端健康检查接口。  
**产物**：`GET /health`  
**提示词**：
```text
请实现 GET /health：
- 返回服务状态、数据库连通性、redis 连通性、minio 连通性（可简化为布尔）
```

### Step 050
**动作**：新增 `.env.example`。  
**产物**：环境变量模板  
**提示词**：
```text
请生成 backend-nest/.env.example，包含：
PORT、DATABASE_URL、REDIS_URL、SESSION_SECRET、MINIO_*、AI_*。
不要放真实密钥。
```

### Step 051
**动作**：创建 Dockerfile（backend）。  
**产物**：`backend-nest/Dockerfile`  
**提示词**：
```text
请为 Nest 项目生成生产可用 Dockerfile（多阶段构建）。
要求：镜像体积尽量小，默认运行 dist/main.js。
```

### Step 052
**动作**：创建 `compose.yml`（重构版）。  
**产物**：`infra/compose.yml`  
**提示词**：
```text
请生成 infra/compose.yml，包含：
- frontend
- backend
- postgres
- redis
- minio
要求网络与端口可本地联调。
```

### Step 053
**动作**：生成 Postman/Bruno API 集合。  
**产物**：`docs/rewrite/06-api-collection.json`  
**提示词**：
```text
请根据已实现接口生成 Postman collection，覆盖 user/canvas/share/ai/health。
```

### Step 054
**动作**：编写登录接口集成测试。  
**产物**：`test/auth.login.e2e-spec.ts`  
**提示词**：
```text
请为 POST /user/login 编写 e2e 测试：
- 正确账号成功
- 错误密码失败
- 返回 envelope 字段断言
```

### Step 055
**动作**：编写 check-auth 集成测试。  
**产物**：`test/auth.check.e2e-spec.ts`  
**提示词**：
```text
请为 POST /user/check-auth 编写 e2e 测试：
- 未登录返回 401
- 登录后返回 user
```

### Step 056
**动作**：编写 canvas create/get 集成测试。  
**产物**：`test/canvas.basic.e2e-spec.ts`  
**提示词**：
```text
请为 canvas 创建与查询接口写 e2e 测试，包含权限校验与返回结构断言。
```

### Step 057
**动作**：编写 share 接口集成测试。  
**产物**：`test/share.e2e-spec.ts`  
**提示词**：
```text
请为 share 的增删改查写 e2e 测试，覆盖 owner 限制和重复分享场景。
```

### Step 058
**动作**：编写 WS 协议测试脚本。  
**产物**：`scripts/ws-contract-test.js`  
**提示词**：
```text
请生成 ws-contract-test.js：
- 建立两个客户端连接同一 canvas
- 发送 addNode/updateNode
- 断言另一个客户端收到广播
```

### Step 059
**动作**：编写 SSE 协议测试脚本。  
**产物**：`scripts/sse-contract-test.js`  
**提示词**：
```text
请生成 sse-contract-test.js：
- 连接 /ai/generate
- 收集 push 事件
- 断言 close 事件出现
```

### Step 060
**动作**：在前端配置切换到新后端地址。  
**产物**：`frontend-web` 环境配置更新  
**提示词**：
```text
请仅修改前端环境变量配置，使 API_BASE_URL 与 WS_BASE_URL 指向新 Nest 后端。
不要改业务组件。
```

### Step 061
**动作**：前端登录联调修复。  
**产物**：前端登录流程可用  
**提示词**：
```text
请只修复前端与新后端在登录流程的兼容问题，范围仅限 apiClient 和登录相关调用。
```

### Step 062
**动作**：前端 Home 列表联调修复。  
**产物**：我的画布/共享画布可显示  
**提示词**：
```text
请只修复 Home 页面对新后端返回数据的兼容问题，不改 UI 设计。
```

### Step 063
**动作**：前端画布详情联调修复。  
**产物**：进入编辑页可加载 nodes/edges  
**提示词**：
```text
请只修复 NoteEditor 初始化加载兼容问题，确保 canvas 数据进入 ReactFlow。
```

### Step 064
**动作**：前端 WS 联调修复。  
**产物**：多人协作增删改可用  
**提示词**：
```text
请只修复 WebSocketProvider 与 WebSocketProxy 的兼容问题，使 add/update/delete node/edge 正常联动。
```

### Step 065
**动作**：前端 share 联调修复。  
**产物**：分享成员管理可用  
**提示词**：
```text
请只修复 ShareComponent 与后端 share 接口之间的字段兼容问题。
```

### Step 066
**动作**：前端 AI SSE 联调修复。  
**产物**：AI 流式输出可见  
**提示词**：
```text
请只修复前端 EventSource 对新 SSE 的兼容处理，确保 push/close 都被正确消费。
```

### Step 067
**动作**：前端缩略图上传联调修复。  
**产物**：缩略图上传成功并可展示  
**提示词**：
```text
请仅修复 withScreenShot 与 uploadThumbnail 接口的兼容问题，确保 30 秒上传周期可用。
```

### Step 068
**动作**：补充后端权限单元测试。  
**产物**：`test/permission.*.spec.ts`  
**提示词**：
```text
请新增权限测试：owner/edit/view 在 canvas/share/ws 三类场景中的放行与拒绝。
```

### Step 069
**动作**：补充后端安全基线（限流）。  
**产物**：登录/AI 接口限流配置  
**提示词**：
```text
请为登录与 AI 相关接口增加限流中间件，提供默认阈值与可配置项。
```

### Step 070
**动作**：补充后端安全基线（输入校验）。  
**产物**：DTO 校验完善  
**提示词**：
```text
请检查并补齐所有 controller DTO 校验规则（长度、枚举、必填、格式）。
```

### Step 071
**动作**：补充后端日志脱敏。  
**产物**：敏感字段不落日志  
**提示词**：
```text
请实现日志脱敏策略：password、token、secret、cookie 不得明文输出。
```

### Step 072
**动作**：补充 OpenAPI 文档导出。  
**产物**：`docs/rewrite/07-openapi.json`  
**提示词**：
```text
请为 Nest 项目接入 Swagger/OpenAPI，并导出静态 openapi.json 到 docs/rewrite。
```

### Step 073
**动作**：生成联调检查清单。  
**产物**：`docs/rewrite/08-integration-checklist.md`  
**提示词**：
```text
请生成联调 checklist：登录、首页、画布、WS、分享、AI、缩略图、登出，每项有通过标准。
```

### Step 074
**动作**：生成回归测试脚本入口。  
**产物**：`scripts/regression.sh` 或 `scripts/regression.ps1`  
**提示词**：
```text
请生成一键回归脚本，顺序执行：lint -> test -> e2e -> ws-contract -> sse-contract。
```

### Step 075
**动作**：生成性能压测脚本（k6）。  
**产物**：`perf/k6-canvas-ws.js`  
**提示词**：
```text
请生成 k6 脚本，压测场景：
- 并发登录
- 画布详情读取
- websocket 房间消息广播延迟
输出关键指标说明。
```

### Step 076
**动作**：生成部署文档。  
**产物**：`docs/rewrite/09-deploy.md`  
**提示词**：
```text
请生成部署文档：本地、测试、生产三套步骤，含环境变量、compose 启停、健康检查。
```

### Step 077
**动作**：生成回滚文档。  
**产物**：`docs/rewrite/10-rollback.md`  
**提示词**：
```text
请生成回滚手册：
- 触发条件
- 回滚步骤
- 数据一致性检查
- 回滚后验证
```

### Step 078
**动作**：生成上线验证文档。  
**产物**：`docs/rewrite/11-go-live-check.md`  
**提示词**：
```text
请生成 go-live 检查单：发布前/发布中/发布后，每项都给具体命令或页面验证动作。
```

### Step 079
**动作**：生成“AI 使用复盘模板”。  
**产物**：`docs/rewrite/12-ai-retro-template.md`  
**提示词**：
```text
请生成 AI 复盘模板：
- 本步骤目标
- 使用提示词
- 产物
- 失败原因
- 修复策略
- 下一步改进
```

### Step 080
**动作**：生成最终迁移报告模板。  
**产物**：`docs/rewrite/13-final-migration-report.md`  
**提示词**：
```text
请生成最终迁移报告模板，包含：
- 范围
- 完成度
- 兼容性结果
- 性能对比
- 风险与后续路线图
```

---

## 使用方式（建议）

- 直接从 Step 001 开始逐条执行。
- 每完成一步，把“AI 回复 + 产物路径 + 验证结果”贴到 commit message 或工作日志。
- 如果你愿意，我下一步可以按这个文档，直接陪你从 **Step 001 到 Step 010** 实操落地。

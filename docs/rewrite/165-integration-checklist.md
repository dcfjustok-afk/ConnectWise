# 联调检查清单

> 每轮前后端联调时，逐项勾选确认。

## 1. 环境准备

- [ ] PostgreSQL 已启动，`DATABASE_URL` 配置正确
- [ ] Redis 已启动，`REDIS_HOST` / `REDIS_PORT` 配置正确
- [ ] MinIO 已启动，`MINIO_ENDPOINT` / `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` 配置正确
- [ ] AI Provider 配置正确（`AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL`）
- [ ] 后端 `npm run start:dev` 启动成功（端口 3000）
- [ ] 前端 `npm start` 启动成功（端口 5173）
- [ ] `GET /api/health` 返回 `status: ok`，db / redis / minio 均为 `up`

## 2. 认证流程

- [ ] 注册：POST /api/user/register → code 200 + session cookie
- [ ] 登录：POST /api/user/login → code 200 + session cookie
- [ ] 鉴权：POST /api/user/check-auth（带 cookie） → 返回用户信息
- [ ] 登出：POST /api/user/logout → session 清除
- [ ] 前端 apiClient 拦截器正常处理 `{code: 200, msg, data}` 响应格式

## 3. 画布 CRUD

- [ ] 创建画布：POST /api/canvas/create/:userId → 返回画布对象
- [ ] 画布列表：GET /api/canvas/user/:userId → 返回数组
- [ ] 画布详情：GET /api/canvas/:id → 返回带 nodes/edges 的完整对象
- [ ] 更新画布：PUT /api/canvas → 更新成功
- [ ] 删除画布：DELETE /api/canvas/:canvasId → 删除成功
- [ ] 连接列表：GET /api/canvas/connection → owned + shared
- [ ] 缩略图上传：POST /api/canvas/uploadThumbnail（FormData，字段名 `thumbnail`） → MinIO 存储

## 4. 分享

- [ ] 查询分享：GET /api/share/user/:userId → 分享列表
- [ ] 查看画布分享：GET /api/share/:canvasId → 当前画布分享记录
- [ ] 创建分享：POST /api/share → 成功
- [ ] 更新分享权限：PUT /api/share → 成功
- [ ] 删除分享：DELETE /api/share/:shareId → 成功
- [ ] 被分享用户以 view/edit 权限访问画布 → 权限正确

## 5. WebSocket 实时协作

- [ ] WS 连接：ws://localhost:3000/ws?canvasId=xxx → 握手成功（需 session cookie）
- [ ] ping/pong 心跳正常
- [ ] addNode / deleteNode / updateNode → 广播给其他客户端
- [ ] addEdge / deleteEdge / updateEdge → 广播给其他客户端
- [ ] flushNode / flushEdge → 持久化并广播 version
- [ ] 前端 WebSocketProxy 字段映射：发送 `data`，接收 `data` → 内部 `operation`

## 6. AI SSE 流式

- [ ] generate：GET /api/ai/generate?… → SSE push 事件流 + close
- [ ] associate：GET /api/ai/associate?… → SSE push + close
- [ ] generate-graph：GET /api/ai/generate-graph?… → SSE push + close
- [ ] generate-graph-str：GET /api/ai/generate-graph-str?… → JSON 响应
- [ ] SSE error 事件正确返回业务错误码
- [ ] 前端 EventSource / withToolTip 正确消费 push/close/error

## 7. 安全与限流

- [ ] 未登录访问受保护接口 → 401
- [ ] 短时间连续请求 login → 被限流 429
- [ ] 短时间连续请求 AI 接口 → 被限流 429
- [ ] 上传非图片文件 → 400 Bad Request
- [ ] 上传超 5MB 文件 → 413 / 400
- [ ] DTO 非法字段 → 400（class-validator 拦截）
- [ ] 错误日志中敏感字段已脱敏（password / token / apiKey）

## 8. 响应格式

- [ ] 所有成功响应：`{code: 200, msg: 'success', data: ...}`
- [ ] 业务异常：`{code: <BizErrorCode>, msg: '中文描述', data: null}`
- [ ] 系统异常：`{code: 500, msg: 'Internal server error', data: null}`
- [ ] 响应头包含 `x-trace-id`

## 9. 跨域

- [ ] 前端 5173 → 后端 3000 请求正常（CORS + credentials）
- [ ] WebSocket 跨域握手正常
- [ ] Cookie（connectwise.sid）正确设置和发送

## 10. Swagger

- [ ] 访问 /docs → Swagger UI 可用
- [ ] 访问 /docs/json → OpenAPI JSON
- [ ] 生产环境 Swagger 不暴露

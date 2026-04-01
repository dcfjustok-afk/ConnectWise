# 错误码映射（旧系统 -> 新系统）

> 说明：当前先给出迁移期推荐映射。实际落地时，以联调阶段确认的前端分支判断逻辑为准，保持稳定不漂移。

| 旧系统错误码 | 场景语义 | 新系统错误类 | HTTP 状态码 | 前端展示建议 |
|---|---|---|---|---|
| 1001 | 参数非法 | ValidationError | 400 | toast: 参数错误，阻止提交 |
| 1002 | 资源不存在 | NotFoundError | 404 | toast: 数据不存在，建议刷新 |
| 1003 | 会话失效/未登录 | UnauthorizedError | 401 | redirect 到登录页 + toast |
| 1004 | 无权限 | ForbiddenError | 403 | toast: 无操作权限 |
| 1005 | 重复数据（用户名/邮箱/分享关系） | ConflictError | 409 | toast: 已存在，提示修改输入 |
| 2001 | 用户名或密码错误 | AuthFailedError | 401 | toast: 登录失败，可重试 |
| 3001 | 画布不存在 | CanvasNotFoundError | 404 | toast + 返回列表页 |
| 3002 | 画布无访问权限 | CanvasAccessDeniedError | 403 | toast: 无访问权限 |
| 3003 | 仅 owner 可操作 | OwnerOnlyError | 403 | toast: 仅所有者可操作 |
| 3004 | 共享成员不存在 | ShareNotFoundError | 404 | toast: 成员记录不存在 |
| 3005 | 共享关系重复 | ShareConflictError | 409 | toast: 该用户已被分享 |
| 3006 | 连接房间已达上限 | CanvasRoomFullError | 429 | toast: 当前协作人数已满，稍后重试 |
| 3007 | 全局连接已达上限 | GlobalWsFullError | 503 | toast: 服务繁忙，稍后重试 |
| 4001 | WS 消息格式错误 | WsBadMessageError | 400 | toast: 协议错误，建议重连 |
| 4002 | WS 未授权连接 | WsUnauthorizedError | 401 | redirect 登录或触发重连 |
| 4003 | WS 无权限访问画布 | WsForbiddenError | 403 | toast: 无协作权限 |
| 4004 | WS 版本冲突 | VersionConflictError | 409 | 本地执行 flushNode/flushEdge 同步 |
| 5001 | AI 服务不可用 | AiProviderUnavailableError | 503 | toast: AI 暂不可用，可重试 |
| 5002 | AI 请求超时 | AiTimeoutError | 504 | toast: AI 超时，建议缩短提示词重试 |
| 5003 | MinIO 上传失败 | StorageUploadError | 502 | toast: 上传失败，自动重试 |
| 5004 | MinIO 删除失败 | StorageDeleteError | 502 | toast: 删除失败，稍后重试 |
| 9000 | 未知内部异常 | InternalServerError | 500 | toast: 系统异常，记录日志并重试 |

## 迁移期规则

- 旧前端已依赖的错误码必须优先保持不变（尤其 3006/3007/4004 类协作场景）。
- 新增错误码只能追加，不能重用已有语义。
- SSE 错误也应输出业务码，便于前端统一处理。

## 前端处理建议

- `401`：统一跳转登录，清理本地用户态。
- `403`：保留页面，不清登录态，显示无权限提示。
- `409`（版本冲突）：触发 `flushNode/flushEdge` 同步后重放用户操作。
- `429/503`：指数退避重试，并给出明确反馈。

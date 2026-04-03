# 错误码冲突检查清单

> 确保新后端错误码与旧后端完全对齐，无冲突无遗漏。

## 错误码映射表

| 码值 | 新后端枚举名 | 旧后端 Java 名 | 状态 |
|------|-------------|----------------|------|
| 1001 | `BAD_REQUEST` | `BAD_REQUEST(1001)` | ✅ 对齐 |
| 1002 | `UNAUTHORIZED` | `UNAUTHORIZED(1002)` | ✅ 对齐 |
| 1003 | `FORBIDDEN` | `FORBIDDEN(1003)` | ✅ 对齐 |
| 1005 | `INTERNAL_ERROR` | `SERVER_ERROR(1005)` | ✅ 对齐 |
| 2001 | `LOGIN_FAILED` | `USER_LOGIN_FAILED(2001)` | ✅ 对齐 |
| 2004 | `USER_ALREADY_EXISTS` | `USER_ALREADY_EXISTS(2004)` | ✅ 对齐 |
| 2005 | `USER_NOT_FOUND` | `USER_NOT_FOUND(2005)` | ✅ 对齐 |
| 2007 | `USER_SESSION_EXPIRED` | `USER_SESSION_EXPIRED(2007)` | ✅ 对齐 |
| 3006 | `CANVAS_NOT_FOUND` | `CANVAS_NOT_FOUND(3006)` | ✅ 对齐 |
| 3007 | `CANVAS_ACCESS_DENIED` | `CANVAS_PERMISSION_DENIED(3007)` | ✅ 对齐 |
| 4003 | `SHARE_PERMISSION_DENIED` | `CANVAS_SHARE_PERMISSION_DENIED(4003)` | ✅ 对齐 |
| 4004 | `SHARE_DUPLICATE` | `CANVAS_SHARE_ALREADY_EXISTS(4004)` | ✅ 对齐 |
| 4005 | `SHARE_NOT_FOUND` | `CANVAS_SHARE_USER_NOT_FOUNT(4005)` | ✅ 对齐 |
| 5007 | `WS_GLOBAL_LIMIT` | `WS_OVER_MAXCONNECTIONS(5007)` | ✅ 对齐 |
| 5008 | `WS_ROOM_LIMIT` | `WS_OVER_ROOM_MAXCONNECTIONS(5008)` | ✅ 对齐 |
| 5009 | `WS_AUTH_FAILED` | （旧系统无） | 🆕 新增 |
| 6001 | `AI_PROVIDER_ERROR` | （旧系统无） | 🆕 新增 |
| 6002 | `AI_TIMEOUT` | （旧系统无） | 🆕 新增 |
| 6003 | `AI_QUOTA_EXCEEDED` | （旧系统无） | 🆕 新增 |

## 冲突检查

### 1. 码值唯一性

- [x] 所有错误码值唯一，无重复
- [x] 编码规则：1xxx 通用、2xxx 用户、3xxx 画布、4xxx 分享、5xxx WS、6xxx AI
- [x] 新增码值均在 5xxx/6xxx 新段位，不与旧系统冲突

### 2. 向前兼容

- [x] 旧系统已有的错误码 **值不变**（前端依赖 code 值做逻辑判断）
- [x] 旧系统已有错误码的 **语义不变**
- [x] 前端 apiClient 拦截器能正确处理所有 code 值

### 3. 响应格式一致

- [x] 所有错误响应格式：`{code: <BizErrorCode>, msg: '中文', data: null}`
- [x] HTTP 状态码与旧系统一致（200 框架 + 业务 code）
- [x] 系统异常统一返回 `code: 500`

### 4. 旧系统存在但新系统未迁移的码值

| 旧码值 | 旧名称 | 原因 |
|--------|--------|------|
| — | — | 所有已使用码值均已迁移 |

### 5. 前端依赖的错误码

| 前端文件 | 依赖的 code | 状态 |
|----------|-------------|------|
| apiClient.js | `code === 200`（成功判断） | ✅ 兼容 |
| apiClient.js | `code !== 200`（错误提示） | ✅ 兼容 |
| WebSocketProxy.js | WS error 中的 code | ✅ 兼容 |
| withToolTip.jsx | SSE `event: error` 中的 code | ✅ 兼容 |

## 结论

- **冲突数**：0
- **新增码值**：4 个（5009, 6001, 6002, 6003），均在新段位
- **风险等级**：🟢 无风险

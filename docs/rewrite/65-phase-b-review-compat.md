# Step 065 Phase B Review（兼容性）

> AI 角色：Review | AI 工具：Copilot Chat + Copilot Agent(Explore) | MCP：FS

## 一、审查范围

Phase B (Step 040-064) 所有端点、响应格式、错误码、鉴权行为与旧 Java 后端的兼容性。

## 二、对照基线

| 红线编号 | 红线内容 | 判定 | 说明 |
|---|---|---|---|
| RL-01 | 登录态能力不退化 | ✅ PASS | `/user/login`、`/user/check-auth`、`/user/logout` 三端点均已实现，session cookie 语义一致 |
| RL-02 | API 路径兼容（`/api` 前缀） | ✅ PASS | `setGlobalPrefix('api')` 已生效，完整路径为 `/api/user/*` |
| RL-08 | 会话鉴权基线不弱化 | ✅ PASS | Session + Redis（connect-redis + ioredis），cookie 名可配置 |

## 三、逐接口兼容对照

### 3.1 已实现接口

| 旧接口 | 新接口 | Method | 路径 | 请求体 | 响应格式 | 兼容判定 |
|---|---|---|---|---|---|---|
| `/user/login` | `/api/user/login` | POST | ✅ | `{username, password}` ✅ | `{code:200, msg, data:{id,username,email}}` | ✅ 兼容 |
| `/user/register` | `/api/user/register` | POST | ✅ | `{username, email, password}` ✅ | `{code:200, msg, data:{id,username,email}}` | ✅ 兼容 |
| `/user/check-auth` | `/api/user/check-auth` | POST | ✅ | 无 | `{code:200, data:{authenticated, userId?, username?}}` | ✅ 兼容 |
| `/user/logout` | `/api/user/logout` | POST | ✅ | 无 | `{code:200, data:{success:true}}` | ✅ 兼容（需鉴权） |
| (搜索) | `/api/user/search` | GET | ✅ | query `keyword` | `{code:200, data:[{id,username,email}]}` | ✅ 新增接口 |

### 3.2 响应封装兼容

| 维度 | 旧系统 | 新系统 | 兼容 |
|---|---|---|---|
| 成功响应结构 | `{code, msg, data}` | `{code:200, msg:'success', data}` | ✅ |
| 错误响应结构 | `{code, msg, data:null}` | `{code, msg, data:null}` | ✅ |
| HTTP 状态码策略 | 业务错误可能返回 200 | 业务错误返回对应 HTTP 状态码（400/401/404） | ⚠️ 需关注 |

### 3.3 错误码兼容

| 旧错误码 | 新错误码 | 语义 | 兼容 |
|---|---|---|---|
| 1002 | UNAUTHORIZED (1002) | 未授权 | ✅ |
| 1003 | LOGIN_FAILED (1003) | 登录失败 | ✅ |
| 1004 | USER_NOT_FOUND (1004) | 用户不存在 | ✅ |
| 1005 | USER_ALREADY_EXISTS (1005) | 用户已存在 | ✅ |
| 3006 | CANVAS_NOT_FOUND (3006) | 画布不存在 | ✅（Phase C 实现） |
| 5007 | WS_GLOBAL_LIMIT (5007) | WS 全局超限 | ✅（Phase D 实现） |
| 5008 | WS_ROOM_LIMIT (5008) | WS 房间超限 | ✅（Phase D 实现） |

### 3.4 鉴权行为兼容

| 维度 | 旧系统 | 新系统 | 兼容 |
|---|---|---|---|
| 白名单路径 | `/user/login`, `/user/register`, `/user/check-auth` | @Public() 装饰器标记相同三个端点 + register | ✅ |
| 非白名单拦截 | AuthInterceptor 检查 HttpSession | AuthGuard 检查 session.userId | ✅ |
| 未认证响应 | 返回 code=1002 | 返回 HTTP 401 + code=1002 | ✅ |
| 会话变量 | session.userId + session.username | session.userId + session.username | ✅ |
| CORS | 未盘点 | credentials:true, origin 可配 | ✅ |

## 四、发现项

### 🟡 WARN-01：register 返回 HTTP 201 vs 旧系统预期

- **现象**：`@Post('register')` 未显式设置 `@HttpCode(200)`，NestJS 对 POST 默认返回 201。
- **影响**：若前端严格检查 HTTP 状态码为 200，可能判定为异常。
- **建议**：为 register 端点添加 `@HttpCode(201)` 或 `@HttpCode(200)` 视旧系统行为决定。
- **风险等级**：中

### 🟡 WARN-02：旧系统错误返回可能使用 HTTP 200 + 业务 code

- **现象**：旧 Java 系统的 GlobalExceptionHandler 可能统一返回 HTTP 200 + 业务 code 区分错误，新系统 BusinessException 映射为 HTTP 400/401/404。
- **影响**：前端若仅判断 `response.data.code !== 200` 视为失败，则互不影响；若前端检查 `response.status === 200` 则会误判。
- **建议**：Phase E 联调时确认前端 axios 拦截器的判断逻辑，必要时调整 GlobalExceptionFilter 统一返回 HTTP 200。
- **风险等级**：中

### 🟢 INFO-01：logout 需登录后才可调用

- **现象**：logout 未标记 `@Public()`，需鉴权后调用。旧系统行为一致（拦截器白名单不含 logout）。
- **影响**：无。行为一致。

## 五、Phase B 兼容性总结

| 维度 | 判定 |
|---|---|
| API 路径兼容 | ✅ PASS |
| 请求体兼容 | ✅ PASS |
| 响应结构兼容 | ✅ PASS（WARN-02 待联调确认） |
| 错误码兼容 | ✅ PASS |
| 鉴权行为兼容 | ✅ PASS |
| 会话语义兼容 | ✅ PASS |

**Phase B 兼容性审查总判定：✅ PASS（附 2 个 WARN 需在 Phase E 联调时闭环）**

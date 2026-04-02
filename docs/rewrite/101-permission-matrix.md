# 权限矩阵文档

> 生成于 Step 101，覆盖 Canvas + Share 全模块的权限策略。

## 1. 角色定义

| 角色 | 描述 |
|------|------|
| **owner** | 画布创建者，拥有完全控制权 |
| **edit** | 被分享者，拥有读写权限 |
| **view** | 被分享者，仅有只读权限 |
| **none** | 无任何关系的用户 |

## 2. Canvas 操作权限矩阵

| 操作 | owner | edit | view | none |
|------|-------|------|------|------|
| POST /canvas/create/:userId | ✅ (self only) | ❌ | ❌ | ❌ |
| GET /canvas/user/:userId | ✅ (self only) | ❌ | ❌ | ❌ |
| GET /canvas/:id | ✅ | ✅ | ✅ | ❌ (3007) |
| PUT /canvas | ✅ | ✅ | ❌ (3007) | ❌ (3007) |
| DELETE /canvas/:canvasId | ✅ | ❌ (3007) | ❌ (3007) | ❌ (3007) |
| GET /canvas/connection | ✅ (any user) | ✅ (any user) | ✅ (any user) | ✅ (any user) |

## 3. Share 操作权限矩阵

| 操作 | owner | edit | view | none |
|------|-------|------|------|------|
| GET /share/user/:userId | ✅ (self only) | ✅ (self only) | ✅ (self only) | ✅ (self only) |
| GET /share/:canvasId | ✅ | ❌ (4003) | ❌ (4003) | ❌ (4003) |
| POST /share | ✅ | ❌ (4003) | ❌ (4003) | ❌ (4003) |
| PUT /share | ✅ | ❌ (4003) | ❌ (4003) | ❌ (4003) |
| DELETE /share/:shareId | ✅ | ✅ (self) | ✅ (self) | ❌ (4003) |

## 4. 错误码索引

| 错误码 | 枚举 | HTTP 状态 | 含义 |
|--------|------|-----------|------|
| 3006 | CANVAS_NOT_FOUND | 404 | 画布不存在 |
| 3007 | CANVAS_ACCESS_DENIED | 403 | 画布权限不足 |
| 4003 | SHARE_PERMISSION_DENIED | 403 | 分享权限不足 |
| 4004 | SHARE_DUPLICATE | 400 | 重复分享 |
| 4005 | SHARE_NOT_FOUND | 400/404 | 分享记录/目标用户不存在 |

## 5. 权限校验实现位置

| 校验点 | 文件 | 方法/逻辑 |
|--------|------|-----------|
| session 鉴权 | auth.guard.ts | `canActivate()` — `session.userId` |
| 画布读权限 | canvas.service.ts | `findOne()` — owner 直通 / canRead(share) |
| 画布写权限 | canvas.service.ts | `update()` — owner 直通 / canWrite(share) |
| 画布删权限 | canvas.service.ts | `remove()` — owner only |
| 路径用户匹配 | canvas.service.ts | `ensurePathUser()` — pathUserId === currentUserId |
| 分享管理权限 | share.service.ts | `findByCanvas/create/update()` — canvas.userId === currentUserId |
| 分享删除权限 | share.service.ts | `remove()` — owner OR self |
| 权限值约束 | canvas-permission.policy.ts | `VALID_PERMISSIONS`, `canRead()`, `canWrite()` |

## 6. 测试覆盖

| 测试类型 | 文件 | 用例数 |
|----------|------|--------|
| Canvas 单测 | canvas.service.spec.ts | 22 |
| Share 单测 | share.service.spec.ts | 19 |
| Canvas e2e | canvas.e2e-spec.ts | 14 |
| Share e2e | share.e2e-spec.ts | 14 |
| **合计** | | **69** |

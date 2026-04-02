# Step 072 错误码映射二次校准

> AI 角色：Spec + Code | AI 工具：Copilot Chat + Copilot Edit | MCP：FS

## 一、校准背景

Phase A Step 014 错误码盘点仅提取了 4 个示例码（1002/3006/5007/5008），未覆盖旧系统完整的 39 个错误码定义。本步基于旧系统 `ResponseCode.java` 全量源码重新校准。

## 二、旧系统错误码全量清单

| 范围 | 编码 | 枚举名 | 语义 |
|---|---|---|---|
| 通用 1xxx | 1000 | SUCCESS | 操作成功 |
| | 1001 | BAD_REQUEST | 请求参数错误 |
| | 1002 | UNAUTHORIZED | 未授权/未登录 |
| | 1003 | FORBIDDEN | 无权限访问 |
| | 1004 | NOT_FOUND | 资源未找到 |
| | 1005 | SERVER_ERROR | 服务器内部错误 |
| | 1006 | OPERATION_FAILED | 操作失败 |
| 用户 2xxx | 2000 | USER_LOGIN_SUCCESS | 登录成功 |
| | 2001 | USER_LOGIN_FAILED | 登录失败 |
| | 2002 | USER_REGISTER_SUCCESS | 注册成功 |
| | 2003 | USER_REGISTER_FAILED | 注册失败 |
| | 2004 | USER_ALREADY_EXISTS | 用户已存在 |
| | 2005 | USER_NOT_FOUND | 用户不存在 |
| | 2006 | USER_PASSWORD_ERROR | 密码错误 |
| | 2007 | USER_SESSION_EXPIRED | 会话过期 |
| 画布 3xxx | 3000-3005 | CANVAS_*_SUCCESS/FAILED | 画布 CRUD 成功/失败码 |
| | 3006 | CANVAS_NOT_FOUND | 画布不存在 |
| | 3007 | CANVAS_PERMISSION_DENIED | 无权操作画布 |
| | 3008-3009 | CANVAS_QUERY_* | 查询成功/失败码 |
| 分享 4xxx | 4000-4002 | CANVAS_SHARE_* | 分享成功/失败/修改权限失败 |
| | 4003 | CANVAS_SHARE_PERMISSION_DENIED | 无权查看分享画布 |
| | 4004 | CANVAS_SHARE_ALREADY_EXISTS | 重复分享 |
| | 4005 | CANVAS_SHARE_USER_NOT_FOUNT | 分享用户不存在 |
| WS 5xxx | 5000-5006 | WS_* | WS 连接/消息/权限/画布码 |
| | 5007 | WS_OVER_MAXCONNECTIONS | 全局连接超限 |
| | 5008 | WS_OVER_ROOM_MAXCONNECTIONS | 房间连接超限 |

## 三、校准前 vs 校准后

| 枚举名 | 校准前 | 校准后 | 旧系统原值 | 变更原因 |
|---|---|---|---|---|
| UNAUTHORIZED | 1002 | 1002 | 1002 | 无变更 ✅ |
| LOGIN_FAILED | **1003** | **2001** | 2001 | 旧 1003=FORBIDDEN，旧 LOGIN_FAILED=2001 |
| USER_NOT_FOUND | **1004** | **2005** | 2005 | 旧 1004=NOT_FOUND(通用)，旧 USER_NOT_FOUND=2005 |
| USER_ALREADY_EXISTS | **1005** | **2004** | 2004 | 旧 1005=SERVER_ERROR，旧 USER_ALREADY_EXISTS=2004 |
| BAD_REQUEST | **2001** | **1001** | 1001 | 旧 BAD_REQUEST=1001，避免与 LOGIN_FAILED 冲突 |
| VALIDATION_FAILED | **2002** | **已移除** | — | 合并入 BAD_REQUEST，旧系统无此码 |
| INTERNAL_ERROR | **2500** | **1005** | 1005 | 对齐旧 SERVER_ERROR |
| FORBIDDEN | **无** | **1003** | 1003 | 新增，对齐旧 FORBIDDEN |
| USER_SESSION_EXPIRED | **无** | **2007** | 2007 | 新增，对齐旧会话过期码 |
| SHARE_NOT_FOUND | **3100** | **4005** | 4005 | 旧分享域使用 4xxx |
| SHARE_DUPLICATE | **3101** | **4004** | 4004 | 旧 CANVAS_SHARE_ALREADY_EXISTS |
| SHARE_PERMISSION_DENIED | **3102** | **4003** | 4003 | 旧 CANVAS_SHARE_PERMISSION_DENIED |
| CANVAS_NOT_FOUND | 3006 | 3006 | 3006 | 无变更 ✅ |
| CANVAS_ACCESS_DENIED | 3007 | 3007 | 3007 | 无变更 ✅ |
| WS_GLOBAL_LIMIT | 5007 | 5007 | 5007 | 无变更 ✅ |
| WS_ROOM_LIMIT | 5008 | 5008 | 5008 | 无变更 ✅ |

## 四、受影响文件

| 文件 | 变更 |
|---|---|
| `src/common/exceptions/biz-error-code.enum.ts` | 枚举值重新编号，合并域分类 |
| `test/auth.e2e-spec.ts` | 数字断言 1005→2004, 1003→2001 |

## 五、说明

- 旧系统同时使用"成功码"（如 1000/2000/3000）和"失败码"；新系统成功统一返回 `code: 200`，仅保留失败码映射
- 前端 axios 拦截器需在 Phase E 联调时确认：是否检查 `response.data.code === 1000` 判断成功
- 新增 `FORBIDDEN(1003)` 和 `USER_SESSION_EXPIRED(2007)` 为后续阶段预留

## 六、验证

- 构建通过：✅
- 单元测试 13/13：✅
- e2e 测试 10/10：✅

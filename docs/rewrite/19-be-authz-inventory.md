# Step 019 后端鉴权与权限盘点

调研目标：梳理旧后端 session 鉴权、拦截机制、权限判断路径。

## 一、鉴权链路

- 拦截器：`src/main/java/com/conwise/interceptor/AuthenticationInterceptor.java`
- 会话来源：`HttpSession`
- 会话存储：`RedisSessionConfig`（Redis Session）

## 二、白名单与拦截

已识别白名单路径：
- `/user/login`
- `/user/register`
- `/user/check-auth`

其他路径由拦截器执行会话校验。

## 三、权限策略（as-is）

- `canvas_shares.permission` 存在 `view/edit` 语义基础。
- 业务中通过 `session userId` + 资源归属判断访问权限。
- 发现 `hasPermission(...)` 存在占位式实现，说明部分权限约束仍待强化。

## 四、风险

- 权限逻辑分散会导致迁移时策略不一致。
- 占位权限实现若未补全，存在越权隐患。

## 五、已确认/待确认

已确认：
- 核心鉴权方式为 Session + 拦截器。

待确认：
- owner/edit/view 的接口级矩阵是否完整落地（需在 Step 060/101 阶段与测试矩阵对齐）。

# Step 026 前端鉴权状态流盘点

调研目标：梳理登录、登出、会话校验与状态持久化策略。

## 一、鉴权流程

1. 登录页调用 `userService.login`。
2. 受保护路由进入前由 `PrivateRoute` 调用 `checkSession`。
3. 校验成功进入业务页面，失败跳转登录页。
4. 登出调用 `userService.logout` 并清理前端状态。

## 二、状态与凭据

- 凭据策略：依赖 Cookie 会话（`withCredentials: true`）。
- 状态策略：Redux 内存态为主，刷新后通过 `checkSession` 恢复。

## 三、证据文件路径

- `src/components/hoc/PrivateRoute.jsx`
- `src/api/apiClient.js`
- `src/api/user.service.js`
- `src/components/pages/Login.jsx`

## 四、已确认/待确认

已确认：
- 现有鉴权流为 Session Cookie + 路由守卫。

待确认：
- `checkSession` 调用频率在高频路由跳转下的性能影响需评估。

# Step 021 前端页面路由盘点

调研目标：梳理页面路由、守卫与重定向。

## 一、路由清单

| Path | 页面/组件 | 备注 |
|---|---|---|
| `/` | 重定向到 `/canvas` | 首页重定向 |
| `/login` | `Login` | 登录页 |
| `/canvas` | `Home` | 受保护路由 |
| `/canvas/:canvasId` | `NoteEditor`（包裹 `WebSocketProvider`） | 协作编辑页 |
| `*` | 重定向 `/login` | 未命中路由回退 |

## 二、守卫与重定向

- 守卫组件：`src/components/hoc/PrivateRoute.jsx`
- 核心行为：进入受保护路由前调用 `checkSession` 进行鉴权。
- 顶层路由定义：`src/App.jsx`

## 三、证据文件路径

- `src/App.jsx`
- `src/components/hoc/PrivateRoute.jsx`

## 四、已确认/待确认

已确认：
- 核心页面与守卫路径已明确。

待确认：
- 路由切换时的鉴权缓存策略是否存在性能优化（目前看每次守卫触发会话校验）。

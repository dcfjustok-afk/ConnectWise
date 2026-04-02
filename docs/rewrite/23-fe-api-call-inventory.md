# Step 023 前端 API 调用点盘点

调研目标：梳理 API 客户端与业务调用映射。

## 一、API 客户端

- 核心客户端：`src/api/apiClient.js`
- 关键特性：`withCredentials`、baseURL、统一拦截策略（若配置）

## 二、服务层文件

- `src/api/user.service.js`
- `src/api/canvas.service.js`
- `src/api/share.service.js`
- `src/api/ai.service.js`

## 三、调用点映射（核心）

| 前端位置 | 调用服务 | 典型后端接口 |
|---|---|---|
| Login 页 | `userService.login` | `/user/login` |
| 路由守卫 | `apiService.checkSession` | `/user/check-auth` |
| Home 页 | `canvasService.fetchCanvasList` | `/canvas/user/:userId` 或等价接口 |
| 编辑页 | `canvasService.fetchCanvasById` | `/canvas/:id` |
| 分享组件 | `shareService` 系列 | `/share/*` |
| AI 功能入口 | `aiService` | `/ai/*` |

## 四、证据文件路径

- `src/api/apiClient.js`
- `src/api/*.service.js`
- `src/components/pages/`

## 五、已确认/待确认

已确认：
- API 调用集中在 `api` 服务层。

待确认：
- 个别页面是否绕过 service 直接发请求（需进一步 grep 验证）。

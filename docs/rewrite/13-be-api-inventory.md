# Step 013 后端 API 清单提取

调研目标：输出旧后端 REST API 的 method/path/request/response 盘点。

## 一、已识别接口（核心域）

| 域 | Method | Path | 请求 | 说明 |
|---|---|---|---|---|
| user | POST | `/user/login` | `LoginUser` | 登录 |
| user | POST | `/user/register` | `RegisterUser` | 注册 |
| user | POST | `/user/check-auth` | - | 会话校验 |
| canvas | GET | `/canvas/{id}` | path 参数 | 获取画布详情 |
| canvas | POST | `/canvas/create/{userId}` | path 参数 | 创建画布 |
| canvas | POST | `/canvas/uploadThumbnail` | multipart | 上传缩略图 |
| share | POST | `/share` | `CanvasShare` | 新增分享 |
| ai | GET | `/ai/generate` | query | SSE 生成 |
| ai | GET | `/ai/associate` | query | SSE 关联 |
| ai | GET | `/ai/generate-graph` | query | SSE 图生成 |

说明：旧系统 context-path 为 `/api`，前端侧完整路径应为 `/api` 前缀 + 上表路径。

## 二、响应与错误

- 统一响应封装由 `ApiResponse`/全局异常机制配合。
- 关键错误码在 `ResponseCode` 中定义（详见 Step 014）。

## 三、已确认/待确认

已确认：
- user/canvas/share/ai 域核心接口已覆盖。

待确认：
- health 域是否存在独立接口（当前扫描未见明确 `HealthController`）。

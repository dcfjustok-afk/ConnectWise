# Step 077 POST /canvas/create/:userId

## 行为定义

- 路径：`POST /canvas/create/:userId`
- 鉴权：需要登录
- 权限：仅允许 `path.userId === session.userId`
- 入参：`title` 必填，`nodes/edges` 可选（默认空数组）

## 实现位置

- Controller: `CanvasController.create`
- Service: `CanvasService.createForUser`
- Repository: `CanvasRepository.create`

## 验收

- 用户可创建自己的画布
- 跨用户创建请求返回无权限错误（`3007`）

## 结果

Passed

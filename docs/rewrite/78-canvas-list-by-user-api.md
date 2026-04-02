# Step 078 GET /canvas/user/:userId

## 行为定义

- 路径：`GET /canvas/user/:userId`
- 鉴权：需要登录
- 权限：仅允许 `path.userId === session.userId`
- 返回：该用户自有画布列表，按 `updatedAt desc` 排序

## 实现位置

- Controller: `CanvasController.findByUser`
- Service: `CanvasService.findByUser`
- Repository: `CanvasRepository.findByOwner`

## 验收

- 可查询自己的画布列表
- 查询他人列表返回权限错误（`3007`）

## 结果

Passed

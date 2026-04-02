# Step 081 DELETE /canvas/:canvasId

## 行为定义

- 路径：`DELETE /canvas/:canvasId`
- 鉴权：需要登录
- 权限：仅 owner 可删除

## 实现位置

- Controller: `CanvasController.remove`
- Service: `CanvasService.remove`
- Repository: `CanvasRepository.deleteById`

## 验收

- owner 删除成功
- 非 owner 返回权限错误（`3007`）

## 结果

Passed

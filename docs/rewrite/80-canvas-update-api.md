# Step 080 PUT /canvas

## 行为定义

- 路径：`PUT /canvas`
- 鉴权：需要登录
- 权限：owner 或被分享且 `permission=edit`
- 入参：`id` 必填，`title/nodes/edges` 可选

## 实现位置

- Controller: `CanvasController.update`
- Service: `CanvasService.update`
- Repository: `CanvasRepository.updateById`

## 验收

- owner 可更新
- edit 权限可更新
- view 或无分享关系不可更新（`3007`）

## 结果

Passed

# Step 079 GET /canvas/:id

## 行为定义

- 路径：`GET /canvas/:id`
- 鉴权：需要登录
- 权限：owner 或被分享用户（任意 permission）可读

## 实现位置

- Controller: `CanvasController.findOne`
- Service: `CanvasService.findOne`
- Repository: `CanvasRepository.findById` + `findSharePermission`

## 验收

- 画布不存在返回 `CANVAS_NOT_FOUND(3006)`
- 无权限返回 `CANVAS_ACCESS_DENIED(3007)`

## 结果

Passed

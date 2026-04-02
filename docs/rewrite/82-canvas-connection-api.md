# Step 082 GET /canvas/connection

## 行为定义

- 路径：`GET /canvas/connection`
- 鉴权：需要登录
- 返回：
  - `owned`: 当前用户拥有的画布 + 分享明细
  - `shared`: 分享给当前用户的画布 + owner 信息

## 实现位置

- Controller: `CanvasController.getConnections`
- Service: `CanvasService.getConnections`
- Repository: `findOwnedConnections` + `findSharedConnections`

## 验收

- 能同时返回 owned/shared 两类连接数据
- 返回结构可供前端关系面板直接消费

## 结果

Passed

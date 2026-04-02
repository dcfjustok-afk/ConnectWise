# Step 076 Canvas Repository 分层

## 目标

将 Canvas 数据访问逻辑下沉到 Repository，Service 仅保留业务编排和权限控制。

## 变更

`CanvasRepository` 提供：

- `create`
- `findByOwner`
- `findById`
- `findSharePermission`
- `updateById`
- `deleteById`
- `findOwnedConnections`
- `findSharedConnections`

## 验收

- Controller 不直接访问 Prisma
- Service 不直接写 Prisma 查询
- 权责清晰，可测试

## 结果

Passed

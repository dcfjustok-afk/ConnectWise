# Step 075 Canvas 模块骨架

## 目标

创建 Canvas 模块骨架，接入 AppModule，可承载后续 Canvas 业务能力。

## 变更

- 新增 `src/canvas/canvas.module.ts`
- 新增 `src/canvas/canvas.controller.ts`
- 新增 `src/canvas/canvas.service.ts`
- 新增 `src/canvas/canvas.repository.ts`
- 新增 `src/canvas/dto/create-canvas.dto.ts`
- 新增 `src/canvas/dto/update-canvas.dto.ts`
- 更新 `src/app.module.ts` 注册 `CanvasModule`

## 验收

- `CanvasModule` 已在 `AppModule` 注入
- 工程可编译
- 权限沿用全局 `AuthGuard`

## 结果

Passed

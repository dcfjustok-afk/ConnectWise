# Step 040 初始化 backend-nest clean skeleton

目标：创建可启动、可构建的 NestJS 基线骨架。

## 一、本步产出

- 新增 `backend-nest` 目录与 Nest 基础工程文件。
- 新增基础入口与健康检查接口。

## 二、关键文件

- `backend-nest/package.json`
- `backend-nest/nest-cli.json`
- `backend-nest/tsconfig.json`
- `backend-nest/tsconfig.build.json`
- `backend-nest/src/main.ts`
- `backend-nest/src/app.module.ts`
- `backend-nest/src/app.controller.ts`
- `backend-nest/src/app.service.ts`

## 三、验收标准

1. `backend-nest` 目录存在且结构完整。
2. 存在启动入口 `src/main.ts`。
3. 存在基础模块 `AppModule` 与健康接口。

## 四、风险提示

- 依赖尚未安装时无法直接运行构建命令。
- 后续步骤接入 Prisma、Session、Redis 前需保证环境变量可用。

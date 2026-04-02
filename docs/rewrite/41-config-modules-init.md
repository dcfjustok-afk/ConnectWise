# Step 041 引入配置模块（app/db/redis/session/minio/ai）

目标：在 Nest 基线工程中引入全局配置能力，并完成六类配置模块落盘。

## 一、本步产出

- 引入 `@nestjs/config` 并在 `AppModule` 以全局方式注册。
- 新增配置模块：
  - `app.config.ts`
  - `db.config.ts`
  - `redis.config.ts`
  - `session.config.ts`
  - `minio.config.ts`
  - `ai.config.ts`
- 新增环境变量校验：`env.validation.ts`。
- 新增环境模板：`.env.example`。

## 二、关键行为

1. `ConfigModule.forRoot` 已启用 `isGlobal` 与 `validationSchema`。
2. `main.ts` 通过 `ConfigService` 读取 `port` 与 `apiPrefix`。
3. 所有配置模块统一通过 `registerAs` 注册，后续模块可按命名空间读取。

## 三、验收标准

1. 六类配置模块文件全部存在。
2. 环境变量缺失/格式错误时可被校验层拦截。
3. `.env.example` 可作为本地启动模板。

## 四、风险提示

- 目前仅完成配置层接线，尚未接入真实 Session/Redis/MinIO 客户端。
- `DATABASE_URL`、`SESSION_SECRET` 等关键变量在本地必须显式赋值后再运行。

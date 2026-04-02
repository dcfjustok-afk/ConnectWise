# Step 042 初始化 Prisma 与 schema

目标：在 `backend-nest` 工程中完成 Prisma 基线初始化与首版 schema 定义。

## 一、本步产出

- 接入 Prisma 依赖：`prisma`、`@prisma/client`。
- 新增 Prisma 脚本：`prisma:format`、`prisma:generate`。
- 新增 schema：`backend-nest/prisma/schema.prisma`。

## 二、schema 覆盖范围

依据 Step 017 盘点，定义三张核心表映射：

1. `users`
2. `canvases`
3. `canvas_shares`

并包含：

- users 的 username/email 唯一约束。
- canvases 的 JSONB 语义字段（Prisma `Json`）。
- canvas_shares 的 `(canvas_id, user_id)` 复合唯一约束与 `permission` 默认值。

## 三、命名与兼容策略

- Prisma 字段使用 camelCase。
- 通过 `@map` 与 `@@map` 映射到旧库 snake_case 表/列名。
- 关系字段按 owner/share 语义建立，便于后续 Step 075+ 直接复用。

## 四、验收标准

1. `prisma/schema.prisma` 可通过格式化与 client 生成。
2. schema 至少覆盖 users/canvases/canvas_shares。
3. 命名映射与约束可用于 Step 043 生成首个 migration。

## 五、风险提示

- 旧库中 `thumbnail_file_name` 为计算列语义，迁移时需在 Step 043 再次核对 DDL 差异。
- 具体外键级联策略若与旧系统不一致，需在迁移 SQL 生成后复核。

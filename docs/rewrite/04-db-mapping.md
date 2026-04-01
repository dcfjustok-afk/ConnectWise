# 数据库迁移映射（旧 SQL -> Prisma）

## users

| 旧表 | 旧字段 | 旧类型 | 约束/默认 | Prisma 模型 | Prisma 字段 | 备注 |
|---|---|---|---|---|---|---|
| users | id | bigint | PK, sequence | User | id | `BigInt @id @default(autoincrement())` |
| users | username | varchar | unique, not null | User | username | `@unique` |
| users | email | varchar | unique, not null | User | email | `@unique` |
| users | password | varchar | not null | User | passwordHash | 建议迁移为哈希口令字段 |

## canvases

| 旧表 | 旧字段 | 旧类型 | 约束/默认 | Prisma 模型 | Prisma 字段 | 备注 |
|---|---|---|---|---|---|---|
| canvases | id | bigint | PK, sequence | Canvas | id | `BigInt @id @default(autoincrement())` |
| canvases | user_id | bigint | FK -> users.id | Canvas | userId | owner |
| canvases | user_name | varchar | nullable | Canvas | userName | 可保留冗余字段以兼容旧数据 |
| canvases | title | varchar | nullable | Canvas | title | 标题 |
| canvases | description | text | nullable | Canvas | description | 描述 |
| canvases | nodes | jsonb | default `[]` | Canvas | nodes | `Json` |
| canvases | edges | jsonb | default `[]` | Canvas | edges | `Json` |
| canvases | settings | jsonb | default `{}` | Canvas | settings | `Json` |
| canvases | created_at | timestamp | default now() | Canvas | createdAt | `@default(now())` |
| canvases | updated_at | timestamp | auto update | Canvas | updatedAt | `@updatedAt` |
| canvases | thumbnail_file_name | generated | 由表达式生成 | Canvas | thumbnailFileName | Prisma 不直接表达 generated，建议改为应用层写入 |

## canvas_shares

| 旧表 | 旧字段 | 旧类型 | 约束/默认 | Prisma 模型 | Prisma 字段 | 备注 |
|---|---|---|---|---|---|---|
| canvas_shares | id | bigint | PK, sequence | CanvasShare | id | `BigInt @id @default(autoincrement())` |
| canvas_shares | canvas_id | bigint | FK -> canvases.id | CanvasShare | canvasId | 关联画布 |
| canvas_shares | user_id | bigint | FK -> users.id | CanvasShare | userId | 被分享用户 |
| canvas_shares | permission | varchar | default `view` | CanvasShare | permission | 建议 enum: `view/edit` |

## 约束与索引映射

| 类型 | 旧系统 | 新系统建议 |
|---|---|---|
| 主键 | 三表均 bigint 自增主键 | Prisma `@id @default(autoincrement())` |
| 唯一 | users.username, users.email | Prisma `@unique` |
| 复合唯一 | canvas_shares(canvas_id, user_id) | Prisma `@@unique([canvasId, userId])` |
| 外键 | canvas.user_id, share.canvas_id, share.user_id | Prisma relation + FK |
| 默认值 | permission/view, created_at/now | Prisma `@default(...)` |

## JSONB 字段策略

| 字段 | 当前策略 | 迁移策略 |
|---|---|---|
| canvases.nodes | JSONB 数组，存 node 列表 | 继续使用 Json 字段；复杂 patch 用 Prisma raw SQL |
| canvases.edges | JSONB 数组，存 edge 列表 | 继续使用 Json 字段；复杂 patch 用 Prisma raw SQL |
| canvases.settings | JSONB 对象 | 使用 Json，按对象整体或局部更新 |

补充说明：
- 保留 JSONB 有助于最小成本兼容旧前端 WS patch 协议。
- 若后续追求强一致与高并发，可再演进为 `nodes/edges` 规范化子表。

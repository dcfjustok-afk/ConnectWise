# Step 017 后端 DB 表结构盘点

调研目标：基于旧 SQL 与模型，梳理核心表结构与约束。

证据文件：`src/main/resources/postgresql.sql`

## 一、核心表

### users
- 主键：`id`
- 关键字段：`username`（唯一）、`email`（唯一）、`password`

### canvases
- 主键：`id`
- 关键字段：`user_id`、`title`、`nodes`(jsonb)、`edges`(jsonb)
- 特性：`thumbnail_file_name` 计算列

### canvas_shares
- 主键：`id`
- 关键字段：`canvas_id`、`user_id`、`permission`（默认 `view`）

## 二、约束与默认值（已识别）

- users 的 username/email 唯一约束。
- share 权限字段存在默认值。
- canvas 内容使用 JSONB 存储图数据。

## 三、已确认/待确认

已确认：
- 三张核心表与 JSONB 策略存在。

待确认：
- 外键声明是否在 SQL 中显式完整定义（需结合 mapper 实际 SQL 再核对）。

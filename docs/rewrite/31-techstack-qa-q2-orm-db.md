# Step 031 技术栈问答 Q2（ORM/DB）

问题：ORM 与数据库方案如何确定？

## 一、候选方案

- A：PostgreSQL + Prisma
- B：PostgreSQL + TypeORM
- C：MySQL + Prisma

## 二、决策

选择 A：PostgreSQL + Prisma。

## 三、理由

1. 旧系统已是 PostgreSQL，迁移成本最低。
2. Prisma schema 与 migration 可提升结构可追溯性，适合 Clean-Room 审计。
3. 旧数据含 JSONB（节点/边），PostgreSQL 原生能力可直接承接。

## 四、风险与缓解

- 风险：复杂 SQL 表达（特别是历史 MyBatis XML 逻辑）迁移成本高。
- 缓解：Prisma + 原生 SQL 混合策略，仅在必要场景落 SQL。

## 五、失败最小修复

- 若某些查询无法高效表达，允许局部使用 `prisma.$queryRaw`，但保持 Prisma 为主入口。

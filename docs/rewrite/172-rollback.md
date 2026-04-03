# ConnectionWise 回滚文档

## 1. 回滚原则

1. **先止血再查因**：发现严重问题先回滚，再排查根因
2. **分层回滚**：按 API → DB → Config 三层独立操作
3. **有据可查**：回滚前后都要保留日志和状态截图
4. **回滚窗口**：部署后 30 分钟内为快速回滚窗口

## 2. 快速回滚：Docker Compose

### 2.1 回滚到上一个版本

```bash
# 1. 停止当前版本
docker compose down

# 2. 切换到上一个稳定版本
git checkout <last-stable-tag>

# 3. 重新构建并启动
docker compose up -d --build

# 4. 验证
curl http://localhost:3000/api/health
```

### 2.2 仅回滚后端

```bash
# 停止后端容器
docker compose stop backend

# 切换后端代码
cd backend-nest && git checkout <last-stable-tag>

# 重建
docker compose up -d --build backend

# 验证
curl http://localhost:3000/api/health
```

### 2.3 仅回滚前端

```bash
docker compose stop frontend
cd frontend && git checkout <last-stable-tag>
docker compose up -d --build frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost/
```

## 3. 数据库回滚

### 3.1 Prisma 迁移回滚

⚠️ Prisma 不支持自动 down migration。需手写回滚 SQL。

```bash
# 查看当前迁移状态
docker compose exec backend npx prisma migrate status

# 手动执行回滚 SQL
docker compose exec postgres psql -U connectwise -d connectwise -f /path/to/rollback.sql
```

### 3.2 数据库备份恢复

```bash
# 部署前备份（纳入部署流程）
docker compose exec postgres pg_dump -U connectwise connectwise > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复
docker compose exec -T postgres psql -U connectwise connectwise < backup_YYYYMMDD_HHMMSS.sql
```

### 3.3 常见 Schema 回滚 SQL

```sql
-- 示例：回滚添加字段
ALTER TABLE "canvas" DROP COLUMN IF EXISTS "new_column";

-- 示例：回滚添加索引
DROP INDEX IF EXISTS "idx_new_index";

-- 示例：回滚表创建
DROP TABLE IF EXISTS "new_table" CASCADE;
```

## 4. 配置回滚

### 4.1 环境变量

```bash
# 1. 恢复旧 .env
cp .env.backup .env

# 2. 重启受影响的服务
docker compose restart backend
```

### 4.2 Nginx 配置

```bash
# 恢复旧 nginx.conf
git checkout <last-stable-tag> -- frontend/nginx.conf

# 重建前端容器
docker compose up -d --build frontend
```

## 5. Redis Session 回滚

如 Session 结构发生破坏性变更：

```bash
# 清空所有 Session（用户需重新登录）
docker compose exec redis redis-cli FLUSHDB

# 或仅清除 session 前缀
docker compose exec redis redis-cli --scan --pattern "sess:*" | xargs redis-cli DEL
```

## 6. MinIO 回滚

```bash
# 如果上传了错误文件，通过 MinIO Console 管理
# 访问 http://localhost:9001 → 手动删除

# 或通过 mc 命令行
docker compose exec minio mc rm --recursive --force local/connectionwise/problematic-path/
```

## 7. 回滚检查清单

| 步骤 | 操作 | 确认 |
|------|------|------|
| 1 | 记录当前版本号和部署时间 | ☐ |
| 2 | 备份数据库 | ☐ |
| 3 | 通知相关人员 | ☐ |
| 4 | 执行回滚操作 | ☐ |
| 5 | 验证 `/api/health` 返回 ok | ☐ |
| 6 | 验证前端页面可访问 | ☐ |
| 7 | 验证登录流程正常 | ☐ |
| 8 | 验证核心业务流程 | ☐ |
| 9 | 记录回滚原因和时间 | ☐ |

## 8. 紧急联系

| 职责 | 操作 |
|------|------|
| 后端问题 | 检查 `docker compose logs backend` |
| 前端问题 | 检查 `docker compose logs frontend` |
| 数据库问题 | 检查 `docker compose logs postgres` |
| 全量回滚 | `docker compose down && git checkout <tag> && docker compose up -d --build` |

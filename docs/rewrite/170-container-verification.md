# 本地容器联调验证

> 执行 `docker compose up -d` 后，按以下步骤验证。

## 前置条件

```bash
# 在项目根目录（D:\aaaProject\ConnectWise）
docker compose up -d --build
```

## 验证步骤

### 1. 基础设施健康

```bash
# PostgreSQL
docker compose exec postgres pg_isready -U connectwise
# 期望：accepting connections

# Redis
docker compose exec redis redis-cli ping
# 期望：PONG

# MinIO
curl -s http://localhost:9000/minio/health/live
# 期望：HTTP 200
```

### 2. 后端健康

```bash
curl -s http://localhost:3000/api/health | jq .
# 期望：
# {
#   "code": 200,
#   "msg": "success",
#   "data": {
#     "status": "ok",
#     "service": "connectionwise-backend-nest",
#     "uptime": ...,
#     "checks": { "db": "up", "redis": "up", "minio": "up" }
#   }
# }
```

### 3. 数据库迁移

```bash
docker compose exec backend npx prisma migrate deploy
# 期望：所有迁移已应用
```

### 4. 前端访问

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost/
# 期望：200

# 浏览器打开 http://localhost → 看到前端页面
```

### 5. API 代理

```bash
# 通过前端 nginx 代理访问后端
curl -s http://localhost/api/health | jq .data.status
# 期望："ok"
```

### 6. Swagger（非生产环境）

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs
# 期望：200（注意：compose 中 NODE_ENV=production，Swagger 不可用）
# 如需测试 Swagger，将 NODE_ENV 改为 development
```

### 7. 注册登录流程

```bash
# 注册
curl -s -c cookies.txt -X POST http://localhost/api/user/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# 登录
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost/api/user/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"test","password":"password123"}'

# 鉴权
curl -s -b cookies.txt -X POST http://localhost/api/user/check-auth
```

### 8. 清理

```bash
docker compose down -v   # -v 同时删除 volumes
rm -f cookies.txt
```

## 问题排查

| 症状 | 排查方向 |
|------|----------|
| backend 启动失败 | `docker compose logs backend`，检查环境变量 |
| DB 连接失败 | 检查 DATABASE_URL，确认 postgres 容器 healthy |
| Redis 连接失败 | 检查 REDIS_HOST 是否 `redis`（compose 服务名） |
| MinIO 连接失败 | 检查 MINIO_ENDPOINT 是否 `http://minio:9000` |
| 前端 API 404 | 检查 nginx.conf 的 proxy_pass 目标为 `http://backend:3000` |
| WS 握手失败 | 检查 nginx.conf `/ws` location 的 Upgrade 头 |

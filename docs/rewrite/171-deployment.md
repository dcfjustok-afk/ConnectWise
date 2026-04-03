# ConnectionWise 部署文档

## 1. 架构概览

```
用户 → Nginx (frontend:80)
          ├── /api/*  → backend:3000 (NestJS)
          ├── /ws     → backend:3000 (WebSocket)
          ├── /minio/ → minio:9000
          └── /*      → SPA (index.html)

backend:3000 → PostgreSQL:5432
             → Redis:6379
             → MinIO:9000
             → AI Provider (OpenAI 兼容)
```

## 2. 环境要求

| 组件 | 最低版本 | 推荐 |
|------|----------|------|
| Docker | 24+ | 最新稳定版 |
| Docker Compose | v2+ | 内置 |
| Node.js | 20 LTS | 20.x（仅开发） |
| PostgreSQL | 15+ | 16-alpine |
| Redis | 7+ | 7-alpine |
| MinIO | 最新 | minio/minio:latest |

## 3. 环境变量

### 3.1 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@host:5432/db` |
| `REDIS_HOST` | Redis 主机 | `redis` |
| `SESSION_SECRET` | Session 签名密钥（≥16字符） | `your-secret-key-here` |
| `MINIO_ENDPOINT` | MinIO 地址 | `http://minio:9000` |
| `MINIO_ACCESS_KEY` | MinIO 访问密钥 | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO 秘密密钥 | `minioadmin` |
| `AI_PROVIDER` | AI 提供商 | `openai` |
| `AI_BASE_URL` | AI API 地址 | `https://api.openai.com/v1` |
| `AI_MODEL` | AI 模型名 | `gpt-3.5-turbo` |

### 3.2 可选变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NODE_ENV` | `development` | 运行环境 |
| `PORT` | `3000` | 后端端口 |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS 允许来源 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `MINIO_BUCKET` | `connectionwise` | MinIO 桶名 |
| `AI_API_KEY` | 空 | AI API 密钥 |
| `AI_TIMEOUT_MS` | `30000` | AI 请求超时 |
| `AI_MAX_RETRIES` | `2` | AI 重试次数 |

## 4. Docker Compose 部署（推荐）

### 4.1 首次部署

```bash
# 1. 克隆代码
git clone <repo-url> && cd ConnectWise

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入实际值

# 3. 构建并启动
docker compose up -d --build

# 4. 运行数据库迁移
docker compose exec backend npx prisma migrate deploy

# 5. 验证
curl http://localhost:3000/api/health
```

### 4.2 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并滚动更新
docker compose up -d --build

# 如有新迁移
docker compose exec backend npx prisma migrate deploy
```

### 4.3 查看日志

```bash
# 所有服务
docker compose logs -f

# 仅后端
docker compose logs -f backend

# 最近 100 行
docker compose logs --tail=100 backend
```

## 5. 裸机部署

### 5.1 后端

```bash
cd backend-nest
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
NODE_ENV=production node dist/main.js
```

### 5.2 前端

```bash
cd frontend
npm ci
npm run build
# 将 dist/ 目录部署到 Nginx / CDN
```

## 6. 健康检查

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 返回 app/db/redis/minio 状态 |

响应示例：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "ok",
    "service": "connectionwise-backend-nest",
    "uptime": 3600.5,
    "checks": { "db": "up", "redis": "up", "minio": "up" }
  }
}
```

- `status: ok` — 所有子系统正常
- `status: degraded` — 部分子系统异常
- `status: down` — 所有子系统异常

## 7. 数据库迁移

```bash
# 应用所有待执行迁移（生产环境）
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status
```

⚠️ **切勿在生产环境使用 `prisma migrate dev`**，该命令会重置数据。

## 8. SSL / HTTPS

生产环境应配置 HTTPS：

1. 在 Nginx 前端容器或上层负载均衡器配置 SSL 证书
2. 设置 `SESSION_COOKIE_SECURE=true`
3. 设置 `SESSION_COOKIE_SAME_SITE=lax`（或 `strict`）
4. 设置 `CORS_ORIGIN` 为实际域名

## 9. 监控建议

- 定期轮询 `/api/health` 并告警 `status !== 'ok'`
- 监控 Docker 容器资源使用（CPU / 内存）
- 监控 PostgreSQL 连接池使用率
- 监控 Redis 内存使用
- 监控 MinIO 磁盘空间

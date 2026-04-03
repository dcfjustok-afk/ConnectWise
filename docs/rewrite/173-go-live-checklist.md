# Go-Live 清单

> 上线前逐项勾选，全部 ✅ 方可发布。

## A. 代码质量

- [ ] TypeScript 编译零错误（`npx tsc --noEmit`）
- [ ] 单元测试 54/54 PASS（`npm test`）
- [ ] E2E 测试 66/66 PASS（`npm run test:e2e`）
- [ ] 无已知 Critical / High 漏洞（`npm audit --production`）
- [ ] 代码已合入主分支并通过 PR Review

## B. 基础设施

- [ ] PostgreSQL 已部署，连接正常
- [ ] Redis 已部署，PING → PONG
- [ ] MinIO 已部署，Bucket 已创建
- [ ] AI Provider 配置正确，API 可达
- [ ] DNS / 域名已配置，指向正确的服务器
- [ ] SSL 证书已安装（HTTPS）

## C. 环境变量

- [ ] `NODE_ENV=production`
- [ ] `SESSION_SECRET` 为强随机值（≥32字符）
- [ ] `SESSION_COOKIE_SECURE=true`
- [ ] `CORS_ORIGIN` 为生产域名
- [ ] `DATABASE_URL` 指向生产数据库
- [ ] `REDIS_PASSWORD` 已设置（如需要）
- [ ] `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` 非默认值
- [ ] `AI_API_KEY` 已配置

## D. 数据库

- [ ] 生产数据库已创建
- [ ] 所有迁移已应用（`prisma migrate deploy`）
- [ ] 迁移状态无 pending（`prisma migrate status`）
- [ ] 已创建数据库备份

## E. 安全

- [ ] Swagger 在生产环境不暴露（`NODE_ENV=production` 时跳过）
- [ ] Session Cookie: `secure=true`, `httpOnly=true`, `sameSite=lax`
- [ ] 限流已启用（登录 3/s、AI 2/s、全局 5/s）
- [ ] 日志中敏感字段已脱敏
- [ ] 上传限制：5MB、仅 png/jpeg/webp

## F. 可观测性

- [ ] `/api/health` 端点可用，返回 db/redis/minio 状态
- [ ] 响应头包含 `x-trace-id`
- [ ] 错误日志包含 traceId、method、URL、脱敏 body
- [ ] 健康检查已接入监控告警

## G. 部署

- [ ] Docker 镜像构建成功
- [ ] `docker compose up` 所有服务启动
- [ ] 后端 Health Check 返回 `status: ok`
- [ ] 前端页面可正常访问
- [ ] API 代理、WS 代理、SSE 代理均正常

## H. 功能验收

- [ ] 注册 → 登录 → 鉴权 → 登出 流程正常
- [ ] 画布 CRUD 正常
- [ ] 分享 CRUD + 权限控制正常
- [ ] WebSocket 实时协作正常
- [ ] AI SSE 流式响应正常
- [ ] 缩略图上传正常

## I. 回滚准备

- [ ] 数据库备份已完成
- [ ] 回滚文档已就绪（172-rollback.md）
- [ ] 上一个稳定版本 tag 已标记
- [ ] 回滚操作已演练
- [ ] 紧急联系人已通知

## J. 发布

- [ ] 选择低峰时段发布
- [ ] 发布后 15 分钟持续监控 health
- [ ] 发布后执行冒烟测试（注册→登录→创建画布→WS协作）
- [ ] 确认无异常后，通知团队发布完成

---

**发布负责人**：________________  
**发布时间**：________________  
**版本号**：________________  

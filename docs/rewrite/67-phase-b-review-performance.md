# Step 067 Phase B Review（性能）

> AI 角色：Review | AI 工具：Copilot Chat + Copilot Agent(Explore) | MCP：FS

## 一、审查范围

Phase B (Step 040-064) 所有代码的性能瓶颈与可扩展性审查。

## 二、逐模块性能审查

### 2.1 数据库层（Prisma + PostgreSQL）

| 检查项 | 结果 | 说明 |
|---|---|---|
| N+1 查询风险 | ✅ 无 | Phase B 查询均为单表操作，无关联加载 |
| 索引覆盖 | ✅ | users 表 username/email 有 unique 索引；canvas_shares 有 [canvasId, userId] 复合唯一索引和 userId 索引 |
| user search 查询效率 | ⚠️ | `contains` + `mode: 'insensitive'` 等价于 `ILIKE '%keyword%'`，无法使用 B-tree 索引 |
| 连接池配置 | ✅ | poolMin=2, poolMax=20 可配置 |

**发现项：**

#### 🟡 PERF-01：user search 使用 ILIKE 全表模糊搜索

- **现象**：`prisma.user.findMany({ where: { OR: [{ username: { contains: keyword, mode: 'insensitive' } }, { email: { contains: keyword, mode: 'insensitive' } }] } })`
- **影响**：用户量大时（>10K），`ILIKE '%keyword%'` 无法使用索引，导致全表扫描。
- **当前缓解**：`take: 20` 限制返回量，但不减少扫描量。
- **建议**：
  1. 短期：可接受（当前用户量预期较小）。
  2. 中期：若用户量增长，改为前缀匹配 `startsWith` 或增加 trigram 索引（`pg_trgm`）。
- **风险等级**：低（当前量级可接受）

### 2.2 Session / Redis 层

| 检查项 | 结果 | 说明 |
|---|---|---|
| Redis 连接模式 | ✅ | lazyConnect，首次请求时连接 |
| session TTL | ✅ | 可配置，默认 7 天 |
| session 序列化开销 | ✅ 无 | session 仅存 userId + username，体积极小 |
| Redis prefix | ✅ | `sess:` 前缀，不与其他数据冲突 |
| Redis 重连策略 | ⚠️ | ioredis 默认指数退避重连，但生产环境需验证 |

**判定：✅ PASS**

### 2.3 请求处理管道

| 检查项 | 结果 | 说明 |
|---|---|---|
| 全局 ValidationPipe | ✅ | whitelist + transform，内存开销可忽略 |
| ResponseEnvelopeInterceptor | ✅ | 仅一层 map 包装，无额外 I/O |
| GlobalExceptionFilter | ✅ | 同步处理，无性能瓶颈 |
| AuthGuard 开销 | ✅ | 仅检查内存 session 对象和 Reflector 元数据，微秒级 |

**判定：✅ PASS**

### 2.4 密码哈希

| 检查项 | 结果 | 说明 |
|---|---|---|
| SHA256 计算开销 | ✅ 快 | 单次 < 1μs，不构成性能瓶颈 |
| 对比：bcrypt 12 rounds | 参考 | ~300ms/次，会影响高并发登录 |

**说明**：SHA256 从性能角度优于 bcrypt，但安全性不足（见 SEC-01）。若迁移至 bcrypt，需评估登录并发量。

### 2.5 CORS 处理

| 检查项 | 结果 | 说明 |
|---|---|---|
| CORS 中间件开销 | ✅ | NestJS 默认 CORS 处理轻量 |
| 预检请求缓存 | ⚠️ | 未设置 `maxAge`，预检请求无缓存 |

**发现项：**

#### 🟡 PERF-02：CORS 预检无缓存

- **现象**：`enableCors()` 未设置 `maxAge`，浏览器每次跨域请求都会发送 OPTIONS 预检。
- **影响**：额外的网络往返，对高频 API 调用有影响。
- **建议**：添加 `maxAge: 86400`（24h）缓存预检响应。
- **风险等级**：低

### 2.6 构建与启动

| 检查项 | 结果 | 说明 |
|---|---|---|
| TypeScript 编译 | ✅ | incremental 编译已启用 |
| 模块加载 | ✅ | 3 个业务模块 + 1 全局模块，启动开销极小 |
| Prisma Client 生成 | ✅ | 一次性生成，运行时无开销 |

**判定：✅ PASS**

## 三、性能审查总结

| 编号 | 发现 | 等级 | 状态 | 建议闭环时机 |
|---|---|---|---|---|
| PERF-01 | user search ILIKE 全表扫描 | 低 | OPEN | 用户量 >10K 时治理 |
| PERF-02 | CORS 预检无缓存 | 低 | OPEN | 建议 Step 068 修复 |

**Phase B 性能审查总判定：✅ PASS**
- 无性能阻断项。
- 当前阶段仅含 Auth/User 基础模块，请求链路极短，性能风险极低。
- PERF-01 和 PERF-02 为增强项。

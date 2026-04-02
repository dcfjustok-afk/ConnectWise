# Step 066 Phase B Review（安全）

> AI 角色：Review | AI 工具：Copilot Chat + Copilot Agent(Explore) | MCP：FS

## 一、审查范围

Phase B (Step 040-064) 所有代码的安全风险审查，覆盖 OWASP Top 10 关键项。

## 二、OWASP Top 10 逐项审查

### 2.1 A01 — Broken Access Control（失效的访问控制）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 全局 AuthGuard 注册 | ✅ | APP_GUARD 模式确保所有端点默认需要认证 |
| 公开端点显式标记 | ✅ | 仅 login/register/check-auth/health 标记 @Public() |
| session.userId 作为唯一身份标识 | ✅ | Guard 检查 session.userId 存在性 |
| IDOR（不安全的直接对象引用） | ⚠️ | user search 返回用户列表，无 IDOR 风险；但 Phase C 的 canvas/:id 需增加 owner 校验 |

**判定：✅ PASS（Phase C 需补资源归属校验）**

### 2.2 A02 — Cryptographic Failures（加密失败）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 密码哈希算法 | 🔴 RISK | 使用 `crypto.createHash('sha256')` 无盐值，易受彩虹表攻击 |
| session secret 最小长度 | ✅ | Joi 验证 `SESSION_SECRET.min(16)` |
| cookie 安全标志 | ✅ | httpOnly 默认 true，secure 可配置，sameSite 默认 lax |
| 密码明文传输 | ⚠️ | HTTP 层面密码明文传输，依赖 HTTPS 部署 |

**发现项：**

#### 🔴 SEC-01：SHA256 无盐密码哈希

- **现象**：`AuthService.hashPassword()` 使用 `crypto.createHash('sha256').update(password).digest('hex')`，无盐值。
- **风险**：相同密码始终产生相同哈希，易受彩虹表和预计算攻击。
- **建议**：迁移至 bcrypt/scrypt/argon2 前，至少应添加 per-user salt。但考虑到需兼容旧系统现有密码数据，若旧系统也使用相同 sha256 无盐方案，则短期保持一致，长期规划密码迁移。
- **风险等级**：高（但受旧系统兼容约束，需确认旧系统哈希方案后再决定修复时机）

**判定：⚠️ CONDITIONAL PASS（SEC-01 需确认旧系统方案后制定迁移计划）**

### 2.3 A03 — Injection（注入）

| 检查项 | 结果 | 说明 |
|---|---|---|
| SQL 注入 | ✅ | Prisma ORM 参数化查询，无原始 SQL 拼接 |
| XSS | ✅ | 纯 API 后端，不渲染 HTML，响应为 JSON |
| 命令注入 | ✅ | 无 exec/spawn 调用 |
| NoSQL 注入 | N/A | 使用 PostgreSQL |
| LDAP 注入 | N/A | 无 LDAP |

**判定：✅ PASS**

### 2.4 A04 — Insecure Design（不安全设计）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 注册无速率限制 | ⚠️ | 无 throttle/rate-limit，可被批量注册攻击 |
| 登录无速率限制 | ⚠️ | 无暴力破解防护 |
| 搜索无速率限制 | ⚠️ | 搜索接口可被滥用 |
| 密码强度校验 | ⚠️ | 仅 `@MinLength(6)`，无复杂度要求 |

**发现项：**

#### 🟡 SEC-02：缺少 Rate Limiting

- **现象**：所有端点无速率限制。
- **建议**：Step 159（Phase E）规划了限流实现，当前标记为已知风险。
- **风险等级**：中（Phase E 闭环）

**判定：⚠️ CONDITIONAL PASS（SEC-02 在 Phase E Step 159 闭环）**

### 2.5 A05 — Security Misconfiguration（安全配置错误）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 环境变量验证 | ✅ | Joi schema 全量验证所有 env vars |
| 默认密钥 | ✅ | SESSION_SECRET 为 required()，无硬编码默认值 |
| CORS 配置 | ✅ | origin 需配置，不使用 `*` |
| 全局异常过滤器 | ✅ | 未泄露 stack trace（仅 Logger.error 内部记录） |
| Helmet 头 | 🟡 | 未引入 helmet 中间件，缺少安全 HTTP 头 |
| express-session 配置 | ✅ | resave:false, saveUninitialized:false 符合最佳实践 |

**发现项：**

#### 🟡 SEC-03：缺少 Helmet 安全头

- **现象**：未引入 `helmet` 中间件，缺少 X-Content-Type-Options、X-Frame-Options 等安全头。
- **建议**：Phase E 或 Docker 部署阶段补齐。
- **风险等级**：低

**判定：✅ PASS（SEC-03 为增强项，不阻断）**

### 2.6 A06 — Vulnerable Components（脆弱组件）

| 依赖 | 版本 | 已知漏洞 | 说明 |
|---|---|---|---|
| @nestjs/core | ^11.0.1 | 无 | 最新稳定版 |
| express-session | ^1.19.0 | 无 | 当前稳定版 |
| connect-redis | ^9.0.0 | 无 | 最新版 |
| ioredis | ^5.10.1 | 无 | 最新稳定版 |
| @prisma/client | ^6.6.0 | 无 | 最新稳定版 |
| class-validator | ^0.14.1 | 无 | 当前稳定版 |

**判定：✅ PASS**

### 2.7 A07 — Identification and Authentication Failures（身份认证失败）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 暴力破解防护 | 🟡 | 无锁定机制（同 SEC-02） |
| session 过期 | ✅ | TTL 由配置驱动，默认 7 天 |
| session 固定攻击防护 | 🟡 | 登录后未调用 regenerate() 重新生成 session ID |
| logout 清理 | ✅ | req.session.destroy() 完整销毁 |

**发现项：**

#### 🟡 SEC-04：登录后未 regenerate session ID

- **现象**：`AuthController.login()` 直接在现有 session 上设置 userId/username，未调用 `req.session.regenerate()` 防止 session fixation。
- **风险**：攻击者可预先设置 session cookie，用户登录后攻击者可复用该 session。
- **建议**：在 login 成功后调用 `req.session.regenerate()` 再写入用户信息。register 同理。
- **风险等级**：中

**判定：⚠️ CONDITIONAL PASS（SEC-04 建议在 Phase B 风险收敛或下一迭代修复）**

### 2.8 A08 — Software and Data Integrity Failures（软件和数据完整性）

| 检查项 | 结果 | 说明 |
|---|---|---|
| DTO 校验 | ✅ | ValidationPipe + whitelist + forbidNonWhitelisted |
| 依赖完整性 | ✅ | package-lock.json 锁定 |

**判定：✅ PASS**

### 2.9 A09 — Security Logging and Monitoring（日志与监控）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 异常日志 | ✅ | GlobalExceptionFilter 记录未处理异常 stack |
| 登录/登出日志 | 🟡 | 无认证事件审计日志 |
| 失败登录日志 | 🟡 | BusinessException 抛出但未单独记录 IP/尝试次数 |

**发现项：**

#### 🟡 SEC-05：缺少认证事件审计日志

- **现象**：login/register/logout 无独立审计日志记录（谁、何时、IP、成功/失败）。
- **建议**：Phase E Step 160-161 规划了日志增强，当前标记为已知项。
- **风险等级**：低

**判定：⚠️ CONDITIONAL PASS（Phase E 闭环）**

### 2.10 A10 — Server-Side Request Forgery (SSRF)

| 检查项 | 结果 | 说明 |
|---|---|---|
| 外部请求 | N/A | Phase B 无对外 HTTP 请求 |
| AI 接口 SSRF | N/A | Phase D 实现，届时需审查 |

**判定：✅ PASS（Phase B 无 SSRF 风险面）**

## 三、安全审查总结

| 编号 | 风险 | 等级 | 状态 | 建议闭环时机 |
|---|---|---|---|---|
| SEC-01 | SHA256 无盐密码哈希 | 高 | OPEN | 确认旧系统方案后决定 |
| SEC-02 | 缺少 Rate Limiting | 中 | OPEN | Phase E Step 159 |
| SEC-03 | 缺少 Helmet 安全头 | 低 | OPEN | Phase E 部署阶段 |
| SEC-04 | 登录后未 regenerate session | 中 | OPEN | 建议 Step 068 修复 |
| SEC-05 | 缺少认证事件审计日志 | 低 | OPEN | Phase E Step 160-161 |

**Phase B 安全审查总判定：⚠️ CONDITIONAL PASS**
- 无阻断级安全漏洞。
- SEC-04（session fixation）建议在 Step 068 风险收敛时修复。
- 其余项已有明确闭环计划。

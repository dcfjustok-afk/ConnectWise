# Step 068 Phase B 风险收敛

> AI 角色：Review | AI 工具：Copilot Chat + Copilot Edit | MCP：FS

## 一、风险来源汇总

本文档汇总 Step 065（兼容）、Step 066（安全）、Step 067（性能）三轮审查发现的所有风险项，逐项判定收敛策略。

## 二、风险清单与收敛状态

| 编号 | 来源 | 风险描述 | 等级 | 收敛动作 | 状态 |
|---|---|---|---|---|---|
| WARN-01 | 兼容 | register 返回 HTTP 201（NestJS POST 默认） | 中 | Phase E 联调确认前端是否检查 status code | DEFERRED → Phase E |
| WARN-02 | 兼容 | 旧系统可能统一返回 HTTP 200 + 业务 code | 中 | Phase E 联调确认前端 axios interceptor 判断逻辑 | DEFERRED → Phase E |
| SEC-01 | 安全 | SHA256 无盐密码哈希 | 高 | 需确认旧系统哈希方案是否一致；若一致则保持兼容，长期规划迁移 | DEFERRED → 确认旧系统方案 |
| SEC-02 | 安全 | 缺少 Rate Limiting | 中 | Phase E Step 159 实现 | DEFERRED → Step 159 |
| SEC-03 | 安全 | 缺少 Helmet 安全头 | 低 | Phase E 部署阶段补齐 | DEFERRED → Phase E |
| SEC-04 | 安全 | 登录后未 regenerate session | 中 | **✅ 已修复** — auth.controller.ts 登录/注册后调用 regenerate() | **CLOSED** |
| SEC-05 | 安全 | 缺少认证事件审计日志 | 低 | Phase E Step 160-161 | DEFERRED → Step 160 |
| PERF-01 | 性能 | user search ILIKE 全表扫描 | 低 | 用户量 >10K 时治理，可加 pg_trgm 索引 | ACCEPTED |
| PERF-02 | 性能 | CORS 预检无缓存 | 低 | **✅ 已修复** — main.ts enableCors 添加 maxAge: 86400 | **CLOSED** |

## 三、已执行的修复

### 3.1 SEC-04 修复：Session Regeneration

**文件**：`backend-nest/src/auth/auth.controller.ts`

**改动**：
- 新增 `regenerateSession()` 私有方法，封装 `req.session.regenerate()` 的 Promise 化调用。
- `register()` 和 `login()` 成功后先调用 `regenerateSession()`，再写入 userId/username。
- 防止 session fixation 攻击。

**验证**：构建通过，13/13 单元测试通过，10/10 e2e 测试通过。

### 3.2 PERF-02 修复：CORS maxAge

**文件**：`backend-nest/src/main.ts`

**改动**：
- `enableCors()` 添加 `maxAge: 86400`（24 小时），浏览器缓存预检响应。

**验证**：构建通过。

## 四、遗留风险接受矩阵

| 风险 | 接受理由 | 兜底 |
|---|---|---|
| SEC-01 (SHA256 无盐) | 旧系统兼容约束；用户量有限 | 后续密码迁移脚本（bcrypt + 渐进式迁移） |
| SEC-02 (无限流) | Phase E 已规划 | NestJS @nestjs/throttler 现成模块 |
| PERF-01 (ILIKE) | 用户量 <10K 性能可接受 | pg_trgm 或 prefix 匹配 |
| WARN-01/02 (HTTP 状态码差异) | Phase E 联调可发现并修复 | GlobalExceptionFilter 一处修改即可统一 |

## 五、Phase B 风险收敛总结

- **已关闭**：2 项（SEC-04, PERF-02）
- **已接受/延迟**：7 项（均有明确闭环计划或接受理由）
- **阻断项**：0 项

**Phase B 风险收敛判定：✅ PASS — 无阻断风险，可进入后续阶段**

# Step 032 技术栈问答 Q3（Session/Redis）

问题：鉴权会话层如何落地？

## 一、候选方案

- A：Session + Redis（cookie 会话）
- B：JWT 无状态
- C：Session + DB 持久化

## 二、决策

选择 A：Session + Redis。

## 三、理由

1. 与旧系统鉴权模型一致，前端 `withCredentials` 已按该模型运行。
2. 能直接复用 `check-auth` 与拦截器/守卫模式，兼容成本最低。
3. Redis 更适合会话存储、过期控制与集中管理。

## 四、风险与缓解

- 风险：跨域、SameSite、代理层配置不当导致会话丢失。
- 缓解：在 Phase B 固化 CORS + Cookie 策略并做 e2e 覆盖。

## 五、失败最小修复

- 若 Redis 可用性异常，允许短时降级单节点并缩短会话 TTL，禁止切换到 JWT 破坏兼容。

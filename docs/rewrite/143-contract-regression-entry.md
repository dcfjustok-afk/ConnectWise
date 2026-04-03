# Step 143 契约与回归入口汇总

## 8 字段执行记录
- AI角色：Spec
- AI工具：Copilot Chat
- MCP：FS + LOG
- 输入提示词：汇总 Phase D 契约测试与回归入口，给出执行顺序与验收口径
- AI Coding参与点：整理命令入口、覆盖范围、失败定位优先级
- 执行命令：无（汇总文档）
- 验收标准：新成员可按本文档独立完成契约验证与回归
- 失败最小修复：补全命令和覆盖说明

## 一键回归入口
1. 全量回归
- 命令：npm run regression
- 覆盖：typecheck + unit + e2e

2. WS 契约
- 命令：npm run test:e2e -- ws-contract.e2e-spec.ts
- 覆盖：握手、广播、冲突回包、异常回包

3. SSE 契约
- 命令：npm run test:e2e -- ai-sse.e2e-spec.ts
- 覆盖：push/close/error、重试、熔断、配额、安全

## 失败定位顺序
1. 先看契约测试失败类型（WS or SSE）
2. 再看 helper/service 层（协议转换或韧性链路）
3. 最后看配置与环境变量

## 验收口径
- 契约：事件语义与错误语义兼容
- 回归：无新增红色用例
- 风险：无阻断项遗留

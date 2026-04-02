# 启动检查

检查范围：Step 000 到 Step 008 产物完整性与可执行性。

## 检查清单

- [x] 后端工作区已清空并准备重启
- [x] rewrite 历史文档已清理
- [x] 会话日志模板已创建
- [x] 提示词模板库已创建
- [x] 门禁规则已创建
- [x] 证据留存规范已创建
- [x] AI 编码策略已创建
- [x] 风险分类标准已创建
- [x] 回滚模板已创建
- [x] 复盘模板已创建

## 产物审计结果

- 存在文件：
	- docs/rewrite/00-session-log.md
	- docs/rewrite/01-prompt-templates.md
	- docs/rewrite/02-gate-rules.md
	- docs/rewrite/03-evidence-policy.md
	- docs/rewrite/04-ai-coding-strategy.md
	- docs/rewrite/05-risk-taxonomy.md
	- docs/rewrite/06-rollback-template.md
	- docs/rewrite/07-retro-template.md
	- docs/rewrite/08-kickoff-check.md
- 发现项：`backend-nest` 目录当前不存在（符合“清空重启”现态，不阻断 Phase A 文档调研阶段）。

## 门禁判定

- Gate 结论：Pass
- 是否允许进入下一阶段：Yes（可进入 Step 010）
- 阻断项：无

## 当前状态

- Gate：已完成 Step 009 启动门禁确认，允许进入 Phase A。

## 备注

- 后续仅按原子步骤执行，不跨步。

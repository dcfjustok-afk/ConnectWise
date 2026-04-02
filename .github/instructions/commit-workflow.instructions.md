---
applyTo: "**"
---

# Git Commit Workflow

## 规则
- Conventional Commits：`type(scope): 中文描述` 或 `type: 中文描述`。
- 冒号 `:` 后必须是中文。
- 一个提交只做一件事。

## 执行流程
1. 检查 staged 与 unstaged 改动。
2. 评估原子化。
3. 非原子化时输出拆分方案。
4. 为每组生成候选提交信息。
5. 仅在用户明确要求时执行提交/推送。

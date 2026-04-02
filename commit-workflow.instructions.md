---
applyTo: "**"
---

# Git Commit Workflow（全局提交规范）

目标：统一提交质量，保证提交历史可读、可回滚、可审查。

## 规则
- 提交必须遵循 Conventional Commits。
- 提交必须原子化：一个提交只做一件事。
- 格式：`type(scope): 中文描述` 或 `type: 中文描述`。
- 冒号 `:` 后的 subject 必须是中文。

## 执行流程
当用户请求“生成提交信息 / 准备提交 / 检查提交信息 / 帮我提交”时，按以下流程：

1. 读取当前 staged 与 unstaged 改动。
2. 评估是否原子化。
3. 若不原子化，先输出拆分方案（按提交粒度分组文件）。
4. 为每组生成 1 条提交信息，格式为 Conventional Commits 且冒号后中文。
5. 仅在用户明确要求执行提交时，才执行 `git add` 和 `git commit`。

## 命令意图映射
- `prepare-commit`：输出拆分方案 + 每组 commit message。
- `conventional-commit`：直接给 1-3 条候选 commit message；若不原子化先给拆分建议。
- `commit-check`：检查 message 格式、中文 subject、与当前改动的原子化一致性。

## 禁区
- 不得在用户未确认时直接提交或推送。
- 不得把不相关改动混入同一提交。
- 不得生成英文 subject。

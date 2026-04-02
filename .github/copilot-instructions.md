# Copilot Repository Instructions

## Git 提交规范
- 提交必须遵循 Conventional Commits。
- 提交必须原子化：一个提交只做一件事。
- 提交信息格式：`type(scope): 中文描述` 或 `type: 中文描述`。
- 冒号 `:` 后面的 subject 必须是中文。

## 提交相关请求执行流程
当用户请求“生成提交信息 / 准备提交 / 检查提交信息 / 帮我提交”时：
1. 先检查 staged 与 unstaged 改动。
2. 判断是否满足原子化提交。
3. 若不满足，先给拆分分组方案。
4. 为每组生成 1 条候选提交信息。
5. 仅在用户明确要求执行时才执行 git add / git commit / git push。

## 命令意图映射
- prepare-commit: 输出拆分方案 + 每组提交信息。
- conventional-commit: 输出 1-3 条候选提交信息；若不原子化先给拆分建议。
- commit-check: 检查格式、中文 subject、原子化一致性。

## Prompt Files（推荐入口）
- 优先使用 `.github/prompts/prepare-commit.prompt.md`。
- 优先使用 `.github/prompts/conventional-commit.prompt.md`。
- 优先使用 `.github/prompts/commit-check.prompt.md`。
- 当用户提到 prepare-commit / conventional-commit / commit-check 时，按上述 Prompt 文件对应流程执行。

## 禁区
- 未经确认直接提交或推送。
- 将不相关改动混入同一提交。
- 生成英文 subject。

# git-commit-workflow

统一提交规范的技能，适用于：
- 生成提交信息
- 拆分原子化提交
- 校验提交信息格式
- 在用户明确要求时执行提交

## 核心规则
- 遵循 Conventional Commits：`type(scope): 中文描述` 或 `type: 中文描述`。
- 冒号 `:` 后必须是中文描述。
- 一个提交只做一件事。

## 标准流程
1. 检查 staged 与 unstaged 改动。
2. 判断是否原子化。
3. 非原子化时，先给分组拆分方案。
4. 每组生成一条候选提交信息。
5. 仅在用户明确要求时执行 `git add` / `git commit` / `git push`。

## 常见触发词
- prepare commit
- conventional commit
- commit check
- 生成提交信息
- 检查提交信息
- 帮我提交

## 输出模板
- 原子化评估：通过/不通过（原因）
- 拆分建议：
- 候选提交信息：
- 若已执行：提交哈希、目标分支、执行结果

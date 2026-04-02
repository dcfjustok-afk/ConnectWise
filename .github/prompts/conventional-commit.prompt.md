---
agent: agent
description: 生成 Conventional Commits 提交信息（中文 subject）
---

请基于当前 staged + unstaged 改动执行：

1. 评估当前改动是否原子化。
2. 若不原子化，先给拆分建议（按提交粒度分组）。
3. 为每组生成 1 条候选提交信息，格式必须是：
   - type(scope): 中文描述
   - 或 type: 中文描述
4. 严格要求：冒号 : 后必须是中文。
5. 若用户明确要求“执行提交/推送”，才允许继续执行 git add / git commit / git push。

输出格式：
- 原子化评估：
- 拆分建议：
- 候选提交信息：
- 若已执行：commit hash、目标分支、结果状态

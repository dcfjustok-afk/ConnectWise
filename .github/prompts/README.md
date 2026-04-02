# Copilot Prompt Files 用法

本目录用于让 GitHub Copilot 直接复用提交相关流程。

## 可用 Prompt
- prepare-commit.prompt.md
- conventional-commit.prompt.md
- commit-check.prompt.md

## 在 VS Code 中使用
1. 打开 Copilot Chat。
2. 使用“Run Prompt”或在提示词选择器里选择本目录 Prompt 文件。
3. 选择对应 prompt 执行。

## 说明
- 这些是 Copilot 原生 Prompt 文件。
- 它们不是 OpenCode 的斜杠命令，因此不会以 `/prepare-commit` 形式出现。
- 若需要“真正的斜杠命令”，需要通过扩展实现自定义 Chat Participant。

#!/usr/bin/env bash
# ConnectionWise 后端全量回归脚本
# 用法：bash scripts/regression.sh
# 退出码：任意步骤失败即退出非零
set -euo pipefail

echo "=============================="
echo " ConnectionWise 回归测试"
echo "=============================="
echo ""

# 1. TypeScript 类型检查
echo "▶ [1/4] TypeScript 类型检查..."
npx tsc --noEmit
echo "✓ TypeScript PASS"
echo ""

# 2. 单元测试（含 WS/SSE 相关 service spec）
echo "▶ [2/4] 单元测试..."
npx jest --forceExit
echo "✓ 单元测试 PASS"
echo ""

# 3. E2E 测试（含 auth/canvas/share/upload/ws-contract/ai-sse）
echo "▶ [3/4] E2E 测试..."
npx jest --config test/jest-e2e.json --forceExit
echo "✓ E2E 测试 PASS"
echo ""

# 4. 汇总
echo "=============================="
echo " 全量回归 PASS ✓"
echo "=============================="

#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Starting production server..."

# Next.js 使用 PORT 和 HOSTNAME 环境变量
export PORT=5000
export HOSTNAME="0.0.0.0"

# 使用 standalone 模式启动（更快）
if [ -f ".next/standalone/server.js" ]; then
  cd .next/standalone
  exec node server.js
elif [ -f ".next/standalone/workspace/projects/server.js" ]; then
  cd .next/standalone/workspace/projects
  exec node server.js
else
  exec pnpm start
fi

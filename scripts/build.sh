#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline

echo "Building the Next.js project..."
pnpm build

# 为 standalone 模式复制静态文件
if [ -d ".next/standalone" ]; then
  echo "Copying static files for standalone mode..."
  
  # 查找 standalone 目录的实际位置
  STANDALONE_DIR=".next/standalone/workspace/projects"
  if [ ! -d "$STANDALONE_DIR" ]; then
    STANDALONE_DIR=".next/standalone"
  fi
  
  # 复制 static 文件
  if [ -d ".next/static" ]; then
    mkdir -p "$STANDALONE_DIR/.next/static"
    cp -r .next/static/* "$STANDALONE_DIR/.next/static/"
  fi
  
  # 复制 public 文件
  if [ -d "public" ]; then
    cp -r public "$STANDALONE_DIR/"
  fi
  
  echo "Static files copied successfully!"
fi

echo "Build completed successfully!"

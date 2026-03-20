#!/bin/bash

# 自动刷新服务脚本
# 每小时检查并保持服务运行

LOG_FILE="/app/work/logs/bypass/keepalive.log"
WORKSPACE="/workspace/projects"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_and_restart() {
    # 检查5000端口是否在监听
    if ! ss -tuln 2>/dev/null | grep -E ':5000[[:space:]]' | grep -q LISTEN; then
        log "服务未运行，正在启动..."
        cd "$WORKSPACE"
        pnpm run start >> "$LOG_FILE" 2>&1 &
        sleep 5
        log "服务已启动"
    else
        log "服务正常运行"
    fi
}

# 主循环 - 每小时检查一次
log "=== 自动刷新服务启动 ==="
while true; do
    check_and_restart
    sleep 3600  # 等待1小时
done

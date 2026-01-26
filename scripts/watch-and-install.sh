#!/bin/bash
#
# 监听文件变化并自动安装到 anheyu-pro
# 用于开发时的热更新
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}👀 监听模式启动${NC}"
echo -e "${YELLOW}监听 src/ 和 public/ 目录的变化${NC}"
echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
echo ""

# 检查是否有 fswatch（macOS）或 inotifywait（Linux）
if command -v fswatch &> /dev/null; then
    # macOS: 使用 fswatch
    fswatch -o \
        "${THEME_DIR}/src" \
        "${THEME_DIR}/public" \
        "${THEME_DIR}/tailwind.config.ts" \
        | while read; do
        echo ""
        echo -e "${YELLOW}📝 检测到文件变化，重新构建...${NC}"
        bash "${SCRIPT_DIR}/install-to-pro.sh"
        echo -e "${GREEN}✅ 完成！请在后台重启 SSR 主题查看效果${NC}"
        echo ""
    done
elif command -v inotifywait &> /dev/null; then
    # Linux: 使用 inotifywait
    while inotifywait -r -e modify,create,delete \
        "${THEME_DIR}/src" \
        "${THEME_DIR}/public" \
        "${THEME_DIR}/tailwind.config.ts" 2>/dev/null; do
        echo ""
        echo -e "${YELLOW}📝 检测到文件变化，重新构建...${NC}"
        bash "${SCRIPT_DIR}/install-to-pro.sh"
        echo -e "${GREEN}✅ 完成！请在后台重启 SSR 主题查看效果${NC}"
        echo ""
    done
else
    echo -e "${RED}❌ 需要安装文件监听工具${NC}"
    echo -e "${YELLOW}💡 macOS: brew install fswatch${NC}"
    echo -e "${YELLOW}💡 Linux: apt install inotify-tools${NC}"
    exit 1
fi

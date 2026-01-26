#!/bin/bash
#
# 主题同步脚本
# 用于构建主题并同步到 anheyu-pro Docker 环境
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
TARGET_DIR="${THEME_DIR}/../anheyu-pro/themes/theme-anheyu-nova"

# 检查目标目录
check_target() {
    if [ ! -d "$(dirname "$TARGET_DIR")" ]; then
        echo -e "${RED}❌ 错误: 目标目录不存在: $(dirname "$TARGET_DIR")${NC}"
        echo -e "${YELLOW}💡 请确保 anheyu-pro 项目在同级目录${NC}"
        exit 1
    fi
}

# 构建主题
build_theme() {
    echo -e "${BLUE}🔨 构建主题...${NC}"
    cd "$THEME_DIR"
    pnpm build
    echo -e "${GREEN}✅ 构建完成${NC}"
}

# 同步到 Docker
sync_to_docker() {
    echo -e "${BLUE}📦 同步到 Docker 环境...${NC}"
    
    # 创建目标目录（如果不存在）
    mkdir -p "$TARGET_DIR"
    
    # 使用 rsync 同步，保留结构
    rsync -av --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='out' \
        "${THEME_DIR}/static/" "$TARGET_DIR/"
    
    echo -e "${GREEN}✅ 同步完成${NC}"
    echo -e "${BLUE}📁 目标目录: ${TARGET_DIR}${NC}"
}

# 显示帮助
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build     只构建主题"
    echo "  sync      只同步到 Docker（不构建）"
    echo "  all       构建并同步（默认）"
    echo "  watch     监听文件变化并自动同步"
    echo "  help      显示帮助"
}

# 监听模式
watch_mode() {
    echo -e "${BLUE}👀 监听模式启动...${NC}"
    echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
    
    # 检查是否有 fswatch
    if ! command -v fswatch &> /dev/null; then
        echo -e "${RED}❌ 需要安装 fswatch${NC}"
        echo -e "${YELLOW}💡 macOS: brew install fswatch${NC}"
        exit 1
    fi
    
    # 监听 src 目录变化
    fswatch -o "${THEME_DIR}/src" | while read; do
        echo -e "${YELLOW}📝 检测到文件变化，重新构建...${NC}"
        build_theme
        sync_to_docker
        echo -e "${GREEN}✅ 完成！刷新浏览器查看效果${NC}"
    done
}

# 主程序
main() {
    check_target
    
    case "${1:-all}" in
        build)
            build_theme
            ;;
        sync)
            sync_to_docker
            ;;
        all)
            build_theme
            sync_to_docker
            ;;
        watch)
            watch_mode
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}❌ 未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"

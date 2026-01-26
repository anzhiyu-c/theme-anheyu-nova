#!/bin/bash
# SSR 主题打包脚本
# 用于将 Next.js 项目打包成可部署的 SSR 主题包
#
# 使用方法:
#   ./scripts/build-ssr-package.sh          # 默认打包
#   ./scripts/build-ssr-package.sh --clean  # 清理后打包
#   ./scripts/build-ssr-package.sh --help   # 显示帮助

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
THEME_NAME="theme-anheyu-nova"
VERSION=$(cat "$PROJECT_ROOT/package.json" | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT_DIR="$PROJECT_ROOT/dist"
PACKAGE_NAME="${THEME_NAME}-v${VERSION}.tar.gz"

# 帮助信息
show_help() {
    echo "SSR 主题打包脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --clean    清理所有缓存后重新构建"
    echo "  --help     显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 增量构建打包"
    echo "  $0 --clean      # 清理后全新构建"
}

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装，请先安装 pnpm: npm install -g pnpm"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 清理构建产物
clean_build() {
    log_info "清理构建产物..."
    rm -rf "$PROJECT_ROOT/.next"
    rm -rf "$OUTPUT_DIR"
    rm -rf "$PROJECT_ROOT/node_modules/.cache"
    log_success "清理完成"
}

# 安装依赖
install_deps() {
    log_info "安装依赖..."
    cd "$PROJECT_ROOT"
    pnpm install --frozen-lockfile
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建 Next.js 项目 (standalone 模式)..."
    cd "$PROJECT_ROOT"
    
    # 使用 webpack 构建（Turbopack 在某些环境下可能有问题）
    NEXT_TURBO=false pnpm build
    
    # 验证构建结果
    if [ ! -d "$PROJECT_ROOT/.next/standalone" ]; then
        log_error "构建失败：standalone 目录不存在"
        exit 1
    fi
    
    log_success "构建完成"
}

# 准备打包目录
prepare_package() {
    log_info "准备打包目录..."
    
    PACKAGE_DIR="$OUTPUT_DIR/$THEME_NAME"
    mkdir -p "$PACKAGE_DIR"
    
    # 使用 rsync 复制 standalone 内容
    # 使用 -L 选项将符号链接转换为实际文件（解决 pnpm 符号链接问题）
    # rsync 返回 23 是部分传输警告，通常可以忽略
    if command -v rsync &> /dev/null; then
        rsync -avL --quiet "$PROJECT_ROOT/.next/standalone/" "$PACKAGE_DIR/" || {
            local ret=$?
            if [ $ret -eq 23 ]; then
                log_warn "rsync 部分传输警告（可忽略）"
            else
                log_error "rsync 复制失败，错误码: $ret"
                exit 1
            fi
        }
    else
        # 备用方案：使用 cp -rL（-L 跟随符号链接）
        cp -rL "$PROJECT_ROOT/.next/standalone/"* "$PACKAGE_DIR/"
    fi
    
    # 复制 static 文件（Next.js 需要）
    mkdir -p "$PACKAGE_DIR/.next"
    cp -rL "$PROJECT_ROOT/.next/static" "$PACKAGE_DIR/.next/"
    
    # 复制 public 文件
    cp -rL "$PROJECT_ROOT/public" "$PACKAGE_DIR/"
    
    # 创建 version.txt
    echo "$VERSION" > "$PACKAGE_DIR/version.txt"
    
    # 创建 theme.json
    cat > "$PACKAGE_DIR/theme.json" << EOF
{
  "name": "$THEME_NAME",
  "version": "$VERSION",
  "author": "安知鱼",
  "description": "Nova - 一个现代化的博客主题，基于 Next.js 和 HeroUI 构建",
  "type": "ssr",
  "framework": "nextjs",
  "entry": "server.js",
  "port": 3000,
  "tags": ["博客", "Next.js", "HeroUI", "SSR", "响应式", "深色模式"]
}
EOF

    # 创建启动脚本
    cat > "$PACKAGE_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
export PORT=${PORT:-3000}
export NODE_ENV=production
exec node server.js
EOF
    chmod +x "$PACKAGE_DIR/start.sh"
    
    log_success "打包目录准备完成"
}

# 创建压缩包
create_archive() {
    log_info "创建压缩包..."
    cd "$OUTPUT_DIR"
    tar -czvf "$PACKAGE_NAME" "$THEME_NAME" > /dev/null 2>&1
    log_success "压缩包创建完成"
}

# 显示结果
show_result() {
    local size=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  打包完成!"
    echo "==========================================${NC}"
    echo ""
    echo "  📦 主题名称: $THEME_NAME"
    echo "  📌 版本号: $VERSION"
    echo "  📁 输出路径: $OUTPUT_DIR/$PACKAGE_NAME"
    echo "  📊 文件大小: $size"
    echo ""
    echo "  🚀 下一步操作:"
    echo "  1. 上传到 OSS/R2: https://pan.anzhiyu.site/d/anheyu/theme-navo/"
    echo "  2. 在官网后台更新主题下载链接"
    echo "  3. 在 anheyu-pro 后台安装并测试"
    echo ""
}

# 主函数
main() {
    # 解析参数
    CLEAN_BUILD=false
    for arg in "$@"; do
        case $arg in
            --clean)
                CLEAN_BUILD=true
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $arg"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "  SSR 主题打包脚本"
    echo "  主题: $THEME_NAME"
    echo "  版本: $VERSION"
    echo "==========================================${NC}"
    echo ""
    
    # 检查依赖
    check_dependencies
    
    # 清理（如果指定）
    if [ "$CLEAN_BUILD" = true ]; then
        clean_build
    else
        # 仅清理输出目录
        rm -rf "$OUTPUT_DIR"
        mkdir -p "$OUTPUT_DIR"
    fi
    
    # 安装依赖
    install_deps
    
    # 构建项目
    build_project
    
    # 准备打包目录
    prepare_package
    
    # 创建压缩包
    create_archive
    
    # 显示结果
    show_result
}

# 执行
main "$@"

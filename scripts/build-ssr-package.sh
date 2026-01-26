#!/bin/bash
# SSR 主题打包脚本
# 用于将 Next.js 项目打包成可部署的 SSR 主题包

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
THEME_NAME="theme-anheyu-nova"
VERSION=$(cat "$PROJECT_ROOT/package.json" | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT_DIR="$PROJECT_ROOT/dist"
PACKAGE_NAME="${THEME_NAME}-v${VERSION}.tar.gz"

echo "=========================================="
echo "  SSR 主题打包脚本"
echo "  主题: $THEME_NAME"
echo "  版本: $VERSION"
echo "=========================================="

# 1. 清理旧的构建产物
echo ""
echo "[1/5] 清理旧的构建产物..."
rm -rf "$PROJECT_ROOT/.next"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 2. 安装依赖
echo ""
echo "[2/5] 安装依赖..."
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile

# 3. 构建 Next.js 项目
echo ""
echo "[3/5] 构建 Next.js 项目 (standalone 模式)..."
pnpm build

# 4. 准备打包目录
echo ""
echo "[4/5] 准备打包目录..."
PACKAGE_DIR="$OUTPUT_DIR/$THEME_NAME"
mkdir -p "$PACKAGE_DIR"

# 使用 tar 复制 standalone 内容（处理符号链接）
cd "$PROJECT_ROOT/.next/standalone"
tar -cf - . | (cd "$PACKAGE_DIR" && tar -xf -)

# 复制 static 文件（Next.js 需要）
mkdir -p "$PACKAGE_DIR/.next"
cp -r "$PROJECT_ROOT/.next/static" "$PACKAGE_DIR/.next/"

# 复制 public 文件
cp -r "$PROJECT_ROOT/public" "$PACKAGE_DIR/"

# 创建 version.txt
echo "$VERSION" > "$PACKAGE_DIR/version.txt"

# 创建 theme.json
cat > "$PACKAGE_DIR/theme.json" << EOF
{
  "name": "$THEME_NAME",
  "version": "$VERSION",
  "author": "安知鱼",
  "description": "Nova - 一个现代化的博客主题，基于 Next.js 和 HeroUI 构建，支持深色/浅色主题切换，响应式布局，SEO 友好",
  "type": "ssr",
  "framework": "nextjs",
  "entry": "server.js",
  "port": 3000,
  "tags": ["博客", "主题", "Next.js", "HeroUI", "SSR", "响应式", "深色模式", "SEO"]
}
EOF

# 5. 打包
echo ""
echo "[5/5] 创建压缩包..."
cd "$OUTPUT_DIR"
tar -czvf "$PACKAGE_NAME" "$THEME_NAME"

# 输出结果
echo ""
echo "=========================================="
echo "  打包完成!"
echo "=========================================="
echo "  输出目录: $OUTPUT_DIR"
echo "  压缩包: $PACKAGE_NAME"
echo "  大小: $(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)"
echo ""
echo "  文件列表:"
ls -la "$PACKAGE_DIR" | head -15
echo ""
echo "  使用方法:"
echo "  1. 将 $PACKAGE_NAME 上传到 OSS/R2 存储"
echo "  2. 在官网后台添加主题，填入下载链接"
echo "  3. 在 anheyu-pro 后台的主题商城安装并启用"
echo "=========================================="

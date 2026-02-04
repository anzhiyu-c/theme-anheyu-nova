#!/bin/bash
#
# 打包 Next.js standalone 输出为 SSR 主题包
# 输出格式：theme-anheyu-nova-{version}.tar.gz
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
THEME_NAME="theme-anheyu-nova"
VERSION=$(node -p "require('${THEME_DIR}/package.json').version")
OUTPUT_DIR="${THEME_DIR}/dist"
OUTPUT_FILE="${OUTPUT_DIR}/${THEME_NAME}-v${VERSION}.tar.gz"
TEMP_DIR="${THEME_DIR}/.pack-temp"

echo -e "${BLUE}📦 打包 ${THEME_NAME} v${VERSION}${NC}"
echo ""

# 清理临时目录
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# 1. 构建 Next.js 应用
echo -e "${BLUE}🔨 步骤 1/4: 构建 Next.js 应用...${NC}"
cd "$THEME_DIR"
pnpm build
echo -e "${GREEN}✅ 构建完成${NC}"
echo ""

# 检查 standalone 输出
if [ ! -f ".next/standalone/server.js" ]; then
    echo -e "${RED}❌ 错误: .next/standalone/server.js 不存在${NC}"
    echo -e "${YELLOW}💡 请确保 next.config.ts 中设置了 output: 'standalone'${NC}"
    exit 1
fi

# 2. 准备打包目录
echo -e "${BLUE}📁 步骤 2/5: 准备打包目录...${NC}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/${THEME_NAME}"

# 复制 standalone 输出（包含 server.js 和 node_modules）
# 使用 rsync 处理符号链接，--ignore-errors 跳过断开的链接
rsync -a --copy-links --ignore-errors .next/standalone/ "$TEMP_DIR/${THEME_NAME}/" 2>/dev/null || true

# 复制静态资源
mkdir -p "$TEMP_DIR/${THEME_NAME}/.next"
rsync -a --copy-links --ignore-errors .next/static/ "$TEMP_DIR/${THEME_NAME}/.next/static/" 2>/dev/null || true

# 复制 public 目录
rsync -a --copy-links --ignore-errors public/ "$TEMP_DIR/${THEME_NAME}/public/" 2>/dev/null || true

# 创建版本文件
echo "$VERSION" > "$TEMP_DIR/${THEME_NAME}/version.txt"

# 复制 theme.json（主题配置）
cp public/theme.json "$TEMP_DIR/${THEME_NAME}/"

echo -e "${GREEN}✅ 目录准备完成${NC}"
echo ""

# 3. 修复路径问题（Docker 容器路径兼容）
echo -e "${BLUE}🔧 步骤 3/5: 修复 Docker 路径兼容性...${NC}"

# Docker 容器中的默认路径
DOCKER_THEME_PATH="/anheyu/themes/${THEME_NAME}"

# 修复 required-server-files.json 中的 appDir 路径
REQUIRED_FILES="$TEMP_DIR/${THEME_NAME}/.next/required-server-files.json"
if [ -f "$REQUIRED_FILES" ]; then
    node -e "
        const fs = require('fs');
        const path = '${REQUIRED_FILES}';
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        data.appDir = '${DOCKER_THEME_PATH}';
        data.relativeAppDir = '';
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        console.log('  ✓ 已修复 appDir: ${DOCKER_THEME_PATH}');
    "
fi

echo -e "${GREEN}✅ 路径修复完成${NC}"
echo ""

# 4. 创建 tar.gz 包
echo -e "${BLUE}📦 步骤 4/5: 创建压缩包...${NC}"
mkdir -p "$OUTPUT_DIR"
cd "$TEMP_DIR"
tar -czvf "$OUTPUT_FILE" "${THEME_NAME}"
echo -e "${GREEN}✅ 压缩包创建完成${NC}"
echo ""

# 5. 显示结果
echo -e "${BLUE}📊 步骤 5/5: 打包结果${NC}"
echo ""
echo -e "${GREEN}✅ 打包成功!${NC}"
echo ""
echo -e "  📦 输出文件: ${OUTPUT_FILE}"
echo -e "  📏 文件大小: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo -e "${YELLOW}📋 使用方式:${NC}"
echo -e "  1. 将压缩包上传到可访问的 URL"
echo -e "  2. 在 anheyu-pro 后台 → 主题商城 → 安装 SSR 主题"
echo -e "  3. 填入下载 URL 并安装"
echo ""
echo -e "${YELLOW}🔧 本地开发快捷方式:${NC}"
echo -e "  运行 ${BLUE}bash scripts/install-to-pro.sh${NC} 直接安装到本地 anheyu-pro"
echo ""

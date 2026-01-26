#!/bin/bash
#
# 将主题直接安装到本地 anheyu-pro 的 themes 目录
# 适用于 Docker 开发环境
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

# anheyu-pro 路径（假设在同级目录）
PRO_DIR="${THEME_DIR}/../anheyu-pro"
THEMES_DIR="${PRO_DIR}/themes"
TARGET_DIR="${THEMES_DIR}/${THEME_NAME}"

# Docker 容器中的路径
DOCKER_THEME_PATH="/anheyu/themes/${THEME_NAME}"

echo -e "${BLUE}🚀 安装 ${THEME_NAME} v${VERSION} 到 anheyu-pro${NC}"
echo ""

# 检查 anheyu-pro 目录是否存在
if [ ! -d "$PRO_DIR" ]; then
    echo -e "${RED}❌ 错误: anheyu-pro 目录不存在: ${PRO_DIR}${NC}"
    echo -e "${YELLOW}💡 请确保 anheyu-pro 项目在同级目录${NC}"
    exit 1
fi

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

# 2. 安装到 themes 目录
echo -e "${BLUE}📁 步骤 2/4: 安装到 themes 目录...${NC}"

# 创建 themes 目录（如果不存在）
mkdir -p "$THEMES_DIR"

# 清理旧版本
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# 复制 standalone 输出（包含 server.js 和 node_modules）
# 使用 rsync 处理符号链接，--ignore-errors 跳过断开的链接
rsync -a --copy-links --ignore-errors .next/standalone/ "$TARGET_DIR/" 2>/dev/null || true

# 复制静态资源
mkdir -p "$TARGET_DIR/.next"
rsync -a --copy-links --ignore-errors .next/static/ "$TARGET_DIR/.next/static/" 2>/dev/null || true

# 复制 public 目录
rsync -a --copy-links --ignore-errors public/ "$TARGET_DIR/public/" 2>/dev/null || true

# 创建版本文件
echo "$VERSION" > "$TARGET_DIR/version.txt"

# 复制 theme.json（主题配置）
cp public/theme.json "$TARGET_DIR/"

echo -e "${GREEN}✅ 安装完成${NC}"
echo ""

# 3. 修复路径问题（Docker 容器路径兼容）
echo -e "${BLUE}🔧 步骤 3/4: 修复 Docker 路径兼容性...${NC}"

# 修复 required-server-files.json 中的 appDir 路径
# Next.js 构建时会写入绝对路径，需要替换为 Docker 容器中的路径
REQUIRED_FILES="${TARGET_DIR}/.next/required-server-files.json"
if [ -f "$REQUIRED_FILES" ]; then
    # 使用 node 来安全地修改 JSON
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

# 4. 显示结果
echo -e "${BLUE}📊 步骤 4/4: 安装结果${NC}"
echo ""
echo -e "${GREEN}✅ 主题已安装到: ${TARGET_DIR}${NC}"
echo ""
echo -e "  📁 themes/${THEME_NAME}/"
echo -e "      ├── server.js          # Node.js 入口"
echo -e "      ├── .next/             # 构建产物"
echo -e "      │   └── static/        # 静态资源"
echo -e "      ├── public/            # 公共文件"
echo -e "      ├── node_modules/      # 依赖"
echo -e "      ├── theme.json         # 主题配置"
echo -e "      └── version.txt        # 版本信息"
echo ""
echo -e "${YELLOW}📋 下一步:${NC}"
echo -e "  1. 重启 Docker: ${BLUE}cd ${PRO_DIR} && make dev-docker${NC}"
echo -e "  2. 或者在后台手动启动 SSR 主题"
echo ""
echo -e "${YELLOW}🔧 热更新开发:${NC}"
echo -e "  运行 ${BLUE}bash scripts/watch-and-install.sh${NC} 监听文件变化并自动安装"
echo ""

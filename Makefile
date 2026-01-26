# theme-anheyu-nova Makefile
# SSR 主题打包和开发命令

.PHONY: help dev build package package-clean clean install

# 默认目标
help:
	@echo ""
	@echo "theme-anheyu-nova 主题命令"
	@echo ""
	@echo "开发命令:"
	@echo "  make dev           - 启动开发服务器"
	@echo "  make build         - 构建生产版本"
	@echo "  make install       - 安装依赖"
	@echo ""
	@echo "打包命令:"
	@echo "  make package       - 打包 SSR 主题（增量构建）"
	@echo "  make package-clean - 打包 SSR 主题（清理后全新构建）"
	@echo ""
	@echo "清理命令:"
	@echo "  make clean         - 清理所有构建产物"
	@echo ""

# 安装依赖
install:
	@echo "📦 安装依赖..."
	pnpm install

# 开发服务器
dev:
	@echo "🚀 启动开发服务器..."
	pnpm dev

# 构建生产版本
build:
	@echo "🔨 构建生产版本..."
	NEXT_TURBO=false pnpm build

# 打包 SSR 主题（增量构建）
package:
	@echo "📦 打包 SSR 主题..."
	chmod +x scripts/build-ssr-package.sh
	./scripts/build-ssr-package.sh

# 打包 SSR 主题（清理后全新构建）
package-clean:
	@echo "📦 清理后打包 SSR 主题..."
	chmod +x scripts/build-ssr-package.sh
	./scripts/build-ssr-package.sh --clean

# 清理构建产物
clean:
	@echo "🧹 清理构建产物..."
	rm -rf .next
	rm -rf dist
	rm -rf node_modules/.cache
	@echo "✅ 清理完成"

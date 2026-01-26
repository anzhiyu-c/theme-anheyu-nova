#!/bin/bash
# 构建并推送 Docker 镜像到 Docker Hub
#
# 使用方法:
#   ./scripts/docker-build.sh          # 构建并推送 latest
#   ./scripts/docker-build.sh v1.0.0   # 构建并推送指定版本

set -e

IMAGE_NAME="anheyu/theme-nova"
VERSION=${1:-latest}

echo "🏗️  Building Docker image: ${IMAGE_NAME}:${VERSION}"

# 构建多平台镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${IMAGE_NAME}:${VERSION} \
  -t ${IMAGE_NAME}:latest \
  --push \
  .

echo "✅ Image pushed: ${IMAGE_NAME}:${VERSION}"
echo "✅ Image pushed: ${IMAGE_NAME}:latest"

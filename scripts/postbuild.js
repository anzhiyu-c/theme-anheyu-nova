/*
 * @Description: 
 * @Author: 安知鱼
 * @Date: 2026-01-23 18:39:30
 * @LastEditTime: 2026-01-26 10:30:19
 * @LastEditors: 安知鱼
 */
#!/usr/bin/env node

/**
 * Post-build script for theme-anheyu-nova
 *
 * SSR 模式说明：
 * - 此脚本在 SSR 模式下不再需要
 * - Next.js `output: "standalone"` 会自动生成完整的服务端部署包
 * - 部署时直接使用 .next/standalone 目录
 *
 * 如果需要为静态导出模式保留此脚本，可以恢复之前的版本
 */

console.log("✅ Next.js SSR 模式：无需 postbuild 处理");
console.log("   构建产物位于 .next/standalone 目录");
console.log("   使用 Dockerfile 构建 Docker 镜像进行部署");

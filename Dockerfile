# Next.js SSR Dockerfile
# 用于构建和运行 theme-anheyu-nova 主题

# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

# 安装依赖需要的工具
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 启用 corepack 以使用 pnpm
RUN corepack enable

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 设置构建时环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN pnpm build

# ==================== 运行阶段 ====================
FROM node:20-alpine AS runner

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache libc6-compat

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
# standalone 输出包含所有需要的 node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 设置文件所有者
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置运行时环境变量（可被 docker-compose 覆盖）
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动服务器
CMD ["node", "server.js"]

# Nova

> ✨ _Shine like a Nova_ — 新星绽放，思想发光

一个现代化的博客主题，基于 Next.js 和 HeroUI 构建，采用真正的服务端渲染（SSR）技术。

## 特性

- 🌟 现代化设计，支持深色/浅色主题
- ⚡ **真正的 SSR**，首屏加载快，SEO 友好
- 🔧 完美适配 anheyu-pro 后端
- 📱 响应式布局，适配各种设备
- 🔍 服务端数据获取，搜索引擎可直接抓取完整内容
- ⚙️ 通过后台动态安装和管理

## 技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **UI 库**: HeroUI 2.8
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **数据获取**: React Server Components + TanStack Query
- **图标**: Lucide React
- **动画**: Framer Motion

## 部署方式

> ⚠️ **注意**: Nova 是一个 SSR 主题，**不支持**传统的压缩包上传安装方式。

### 通过后台动态安装

适用于 anheyu-pro 用户，支持在后台一键安装和管理 SSR 主题。

1. 确保使用最新版本的 anheyu-pro（支持 SSR 主题动态安装）

2. 进入后台 → 系统管理 → 主题商城

3. 找到 **theme-anheyu-nova**，点击「安装主题」

4. 安装完成后，点击「启用主题」

5. 主题将在内部 3000 端口运行，Go 后端自动代理请求

详细配置请参考 [SSR 主题部署文档](https://dev.anheyu.com/docs/ssr-theme-deploy)

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（需要运行 anheyu-pro 后端）
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 环境变量

创建 `.env.local` 文件：

```env
# 服务端 API 地址（SSR 数据获取）
API_URL=http://localhost:8091

# 客户端 API 地址（浏览器端请求）
NEXT_PUBLIC_API_URL=http://localhost:8091
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/         # 前台页面
│   │   ├── page.tsx        # 首页
│   │   ├── posts/          # 文章列表/详情
│   │   ├── categories/     # 分类页
│   │   ├── tags/           # 标签页
│   │   └── about/          # 关于页
│   ├── globals.css         # 全局样式
│   └── layout.tsx          # 根布局
├── components/             # UI 组件
│   └── frontend/
│       └── layout/         # 布局组件
├── lib/
│   └── server.ts           # 服务端数据获取
├── providers/              # React Providers
└── store/                  # Zustand Store
    └── api/                # TanStack Query API

public/
└── static/                 # 静态资源
    ├── img/
    └── fonts/
```

## SSR 工作原理

```
用户请求 → Go 后端 (8091)
               ↓
    ┌──────────────────────────┐
    │ /api/* → 直接处理        │
    │ /admin → 直接处理        │
    │ 其他 → 代理到 Next.js    │
    └──────────────────────────┘
               ↓
Next.js (内部 3000) → 调用 Go API → 返回完整 HTML
```

### 与传统主题的区别

| 特性       | 传统主题（静态导出） | Nova（SSR）  |
| ---------- | -------------------- | ------------ |
| 渲染方式   | 客户端渲染           | 服务端渲染   |
| SEO        | 需要预渲染           | 天然支持     |
| 首屏加载   | 需等待 JS            | 直接显示内容 |
| 数据新鲜度 | 构建时固定           | 每次请求实时 |
| 部署方式   | 压缩包上传           | 后台安装     |

## 主题配置

主题支持通过 anheyu-pro 后台进行配置：

### 外观设置

- **主题色**: 自定义网站主色调
- **默认主题**: 浅色/深色/跟随系统
- **启用动画**: 开关页面过渡动画

### 布局设置

- **侧边栏位置**: 左侧/右侧/隐藏
- **每页文章数**: 5-50 篇

### 页脚设置

- **显示运行时间**: 开关网站运行时间显示
- **自定义页脚内容**: 支持 HTML

## 自定义开发

### 修改主题颜色

编辑 `tailwind.config.ts` 中的 HeroUI 主题配置：

```typescript
heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6", // 修改主色
        },
      },
    },
  },
});
```

### 添加新页面

1. 在 `src/app/(frontend)/` 下创建页面目录
2. 创建 `page.tsx` 文件
3. 使用 React Server Components 获取数据
4. 重新构建并部署

### 构建 Docker 镜像

```bash
# 构建镜像
docker build -t anheyu/theme-nova:latest .

# 推送到 Docker Hub
docker push anheyu/theme-nova:latest
```

## 常见问题

### Q: 为什么不能通过后台上传安装？

A: Nova 使用真正的 SSR 技术，需要 Node.js 运行时环境。传统的静态文件上传方式无法运行 Next.js 服务器。

### Q: 如何更新主题？

A: 通过后台「主题商城」可以一键更新。

### Q: 可以同时使用 SSR 主题和传统主题吗？

A: 可以。通过后台切换，停用 SSR 主题后会自动回退到传统主题。

## License

MIT

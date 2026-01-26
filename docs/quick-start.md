# 主题开发快速开始

本文档将指导你如何开发 AnHeYu 博客主题。

## 技术架构

Nova 主题采用 **Go 模板完整渲染 + React Hydration** 架构：

- **服务端**：Go 模板引擎渲染完整的 HTML（包括文章内容）
- **客户端**：React 接管页面，添加交互功能
- **结果**：SEO 效果等同于 SSR，同时保持单二进制部署的简单性

```
用户请求 → Go 后端渲染完整 HTML → 返回页面
                                   ↓
                              浏览器显示内容
                                   ↓
                              加载 React JS
                                   ↓
                              Hydration 接管
                                   ↓
                              页面可交互
```

## 环境准备

- Node.js 18+
- pnpm 8+
- Go 1.21+（可选，用于本地测试）

## 项目结构

```
theme-anheyu-nova/
├── src/                    # React 组件源码
│   ├── app/               # Next.js App Router 页面
│   ├── components/        # 可复用组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   └── types/            # TypeScript 类型定义
├── templates/             # Go 模板（核心）
│   ├── index.html        # 首页模板
│   ├── posts.html        # 文章列表模板
│   ├── posts/
│   │   └── __template__.html  # 文章详情模板
│   └── components/       # 可复用组件模板
│       ├── header.html
│       ├── footer.html
│       ├── article-card.html
│       └── pagination.html
├── public/                # 静态资源
│   └── theme.json        # 主题配置
├── scripts/               # 构建脚本
│   ├── postbuild.js      # 构建后处理
│   ├── sync-to-docker.sh # 同步到 Docker
│   └── validate-template.js  # 模板验证
└── docs/                  # 文档
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（仅前端）
pnpm dev

# 构建主题
pnpm build

# 构建并同步到 Docker
pnpm deploy

# 只同步（不构建）
pnpm sync

# 验证模板
node scripts/validate-template.js
```

## 核心概念

### 1. 双重渲染

每个页面都由两部分组成：

- **Go 模板**：渲染完整的 HTML 结构和内容
- **React 组件**：Hydration 后处理交互

两者的 HTML 结构必须一致！

### 2. 数据注入

Go 后端通过 `window.__INITIAL_DATA__` 注入数据：

```html
<script>
  window.__INITIAL_DATA__ = {{json .initialData}};
  window.__SITE_CONFIG__ = {{json .siteConfig}};
</script>
```

React 组件通过 Hook 读取：

```tsx
import { useInitialData } from "@/lib/initialData";

function MyComponent() {
  const initialData = useInitialData();
  // 使用初始数据...
}
```

### 3. Hydration 兼容

对于可能不一致的内容，使用 `suppressHydrationWarning`：

```tsx
<div className="content" dangerouslySetInnerHTML={{ __html: content }} suppressHydrationWarning />
```

对于动画组件，使用 `useHydrated` Hook：

```tsx
import { useHydrated } from "@/hooks";

function AnimatedComponent() {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return <div className="static-content">...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      ...
    </motion.div>
  );
}
```

## 下一步

- [Go 模板编写指南](./template-guide.md)
- [模板变量 API 参考](./api-reference.md)
- [迁移指南](./migration-guide.md)

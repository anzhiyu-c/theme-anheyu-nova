# 迁移指南

本文档帮助你从旧版主题迁移到新的 Go 模板完整渲染 + Hydration 架构。

## 版本说明

| 版本 | 渲染模式             | SEO 效果 | 说明             |
| ---- | -------------------- | -------- | ---------------- |
| v1.x | Go 仅渲染 SEO 元数据 | 一般     | 内容由 React CSR |
| v2.x | Go 完整渲染          | 优秀     | 等同于 SSR       |
| v3.x | 支持完全 SSR         | 最佳     | Docker 用户可选  |

## 从 v1.x 迁移到 v2.x

### 1. 更新 theme.json

```json
{
  "name": "your-theme",
  "version": "2.0.0",
  "engineVersion": 2,
  "renderMode": "full",
  "compatibility": {
    "minAppVersion": "1.7.0",
    "renderMode": "full"
  }
}
```

### 2. 创建模板目录

```bash
mkdir -p templates/components
```

### 3. 编写 Go 模板

将原来的 HTML 结构迁移到 Go 模板：

**原来（React 渲染）：**

```tsx
// src/app/posts/[slug]/page.tsx
export default function PostPage({ article }) {
  return (
    <article className="post-detail">
      <h1>{article.title}</h1>
      <div className="content">{article.content}</div>
    </article>
  );
}
```

**现在（Go 模板渲染）：**

```html
<!-- templates/posts/__template__.html -->
<article class="post-detail">
  <h1>{{.article.Title}}</h1>
  <div class="content">{{.article.ContentHTML}}</div>
</article>
```

### 4. 更新 React 组件使用 **INITIAL_DATA**

```tsx
// 旧方式：通过 API 获取数据
const { data: article } = useArticle(slug);

// 新方式：优先使用服务端注入的数据
const initialData = useInitialData();
const article = initialData?.article || fetchedArticle;
```

### 5. 处理 Hydration

添加必要的 `suppressHydrationWarning`：

```tsx
<div
  className="content"
  dangerouslySetInnerHTML={{ __html: content }}
  suppressHydrationWarning // 新增
/>
```

对于动画组件，使用 `useHydrated`：

```tsx
const isHydrated = useHydrated();

if (!isHydrated) {
  return <div className="static">...</div>;
}

return <motion.div>...</motion.div>;
```

### 6. 更新 postbuild.js

简化构建脚本，只复制静态资源：

```javascript
// 主要职责：
// 1. 复制 _next 目录
// 2. 处理 CSS/JS 路径
// 3. 不再复杂处理 HTML 合并
```

### 7. 测试

```bash
# 构建
pnpm build

# 同步到 Docker
pnpm sync

# 验证 SEO
curl http://localhost:8091/posts/your-article | grep "<article"
```

## 迁移检查清单

- [ ] 更新 theme.json，设置 `engineVersion: 2`
- [ ] 创建 templates/ 目录结构
- [ ] 编写首页 Go 模板 (index.html)
- [ ] 编写列表页 Go 模板 (posts.html)
- [ ] 编写详情页 Go 模板 (posts/**template**.html)
- [ ] 编写组件模板 (header, footer, article-card, pagination)
- [ ] 更新 React 组件使用 useInitialData
- [ ] 添加 suppressHydrationWarning
- [ ] 处理动画组件的 Hydration
- [ ] 运行模板验证脚本
- [ ] 测试 SEO 效果

## 常见问题

### Q: Hydration 报错怎么办？

A: 检查 Go 模板和 React 组件的 HTML 结构是否一致。常见原因：

- 多余的 wrapper div
- 条件渲染逻辑不一致
- 循环顺序不一致

### Q: 动画不工作了？

A: 动画组件需要使用 `useHydrated` Hook，在 Hydration 完成前显示静态版本。

### Q: CSS 样式丢失？

A: 检查 postbuild.js 是否正确处理了 CSS 路径，确保 CSS_PLACEHOLDER 被正确替换。

### Q: 旧主题还能用吗？

A: 可以。Go 后端会自动检测主题版本，对 v1.x 主题使用旧的渲染逻辑。

## 回滚方案

如果迁移出现问题，可以回滚：

1. 将 theme.json 中的 `engineVersion` 改回 1
2. 删除 templates/ 目录
3. 重新构建部署

## 获取帮助

- 文档：https://docs.anheyu.com/themes
- GitHub Issues：https://github.com/anzhiyu-c/theme-anheyu-nova/issues
- 社区讨论：https://github.com/anzhiyu-c/theme-anheyu-nova/discussions

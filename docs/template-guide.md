# Go 模板编写指南

本文档详细介绍如何编写与 React 组件兼容的 Go 模板。

## 模板语法基础

### 变量输出

```go
// 基础输出（会自动转义 HTML）
{{.article.Title}}

// 输出 HTML（不转义，用于文章内容）
{{.article.ContentHTML}}
```

### 条件判断

```go
{{if .article.Cover}}
  <img src="{{.article.Cover}}" alt="{{.article.Title}}">
{{else}}
  <div class="default-cover"></div>
{{end}}

// 多条件
{{if eq .article.Status "published"}}
  公开
{{else if eq .article.Status "draft"}}
  草稿
{{else}}
  未知
{{end}}
```

### 循环

```go
{{range .articles}}
  <article class="article-card" data-id="{{.ID}}">
    <h2>{{.Title}}</h2>
    <p>{{.Excerpt}}</p>
  </article>
{{end}}

// 带索引
{{range $index, $article := .articles}}
  <article data-index="{{$index}}">{{$article.Title}}</article>
{{end}}
```

### 模板定义和调用

```go
// 定义模板（components/article-card.html）
{{define "article-card"}}
<article class="article-card" data-id="{{.ID}}">
  <h2>{{.Title}}</h2>
</article>
{{end}}

// 调用模板
{{template "article-card" .article}}

// 在循环中调用
{{range .articles}}
{{template "article-card" .}}
{{end}}
```

### 自定义函数

```go
// 使用 json 函数输出 JSON
<script>
  window.__INITIAL_DATA__ = {{json .initialData}};
</script>

// 使用 safeHTML 输出不转义的 HTML
{{.article.ContentHTML}}
```

## 与 React 组件对应

### 原则：结构必须一致

**React 组件：**

```tsx
<article className="article-detail" data-id={article.id}>
  <header className="article-header">
    <h1 className="article-title">{article.title}</h1>
  </header>
  <div className="article-content prose">{/* 内容 */}</div>
</article>
```

**Go 模板（必须一致）：**

```html
<article class="article-detail" data-id="{{.article.ID}}">
  <header class="article-header">
    <h1 class="article-title">{{.article.Title}}</h1>
  </header>
  <div class="article-content prose">{{.article.ContentHTML}}</div>
</article>
```

### 对照表

| 元素     | Go 模板                       | React 组件                     | 注意             |
| -------- | ----------------------------- | ------------------------------ | ---------------- |
| 类名     | `class="foo"`                 | `className="foo"`              | 值必须相同       |
| 数据属性 | `data-id="{{.ID}}"`           | `data-id={id}`                 | 值必须相同       |
| 条件渲染 | `{{if .cover}}<img>{{end}}`   | `{cover && <img>}`             | 条件逻辑必须一致 |
| 循环     | `{{range .tags}}`             | `{tags.map()}`                 | 顺序必须一致     |
| 动态样式 | `style="--color: {{.color}}"` | `style={{ '--color': color }}` | 值必须相同       |
| 动画     | 无                            | `<motion.div>`                 | 使用 isHydrated  |

## 模板结构示例

### 文章详情页

```html
{{define "base"}}
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <!-- SEO Meta Tags -->
    <title>{{.article.Title}} - {{.siteConfig.SiteName}}</title>
    <meta name="description" content="{{.article.Excerpt}}" />

    <!-- Open Graph -->
    <meta property="og:title" content="{{.article.Title}}" />
    <meta property="og:description" content="{{.article.Excerpt}}" />

    <!-- JSON-LD -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{{.article.Title}}",
        "description": "{{.article.Excerpt}}"
      }
    </script>

    <!-- CSS_PLACEHOLDER -->
  </head>
  <body>
    <div id="__next">
      {{template "header" .}}

      <main>
        <article class="article-detail" data-id="{{.article.ID}}">
          <!-- Hero -->
          <section class="post-hero">
            <img src="{{.article.Cover}}" alt="{{.article.Title}}" />
            <h1>{{.article.Title}}</h1>
          </section>

          <!-- Content -->
          <section class="post-content">
            <div class="prose">{{.article.ContentHTML}}</div>
          </section>

          <!-- Tags -->
          {{if .article.Tags}}
          <section class="post-tags">
            {{range .article.Tags}}
            <a href="/tags/{{.Slug}}" class="tag">#{{.Name}}</a>
            {{end}}
          </section>
          {{end}}
        </article>
      </main>

      {{template "footer" .}}
    </div>

    <!-- 数据注入 -->
    <script>
      window.__INITIAL_DATA__ = {{json .initialData}};
      window.__SITE_CONFIG__ = {{json .siteConfig}};
    </script>

    <!-- JS_PLACEHOLDER -->
  </body>
</html>
{{end}}
```

## 常见错误

### 1. 结构不一致

```html
<!-- 错误：Go 模板多了一层 wrapper -->
<div class="wrapper">
  <article>...</article>
</div>

<!-- 正确：与 React 结构一致 -->
<article>...</article>
```

### 2. 忘记处理空值

```html
<!-- 错误：可能输出空字符串 -->
<img src="{{.article.Cover}}" />

<!-- 正确：提供默认值 -->
{{if .article.Cover}}
<img src="{{.article.Cover}}" />
{{else}}
<img src="/static/img/default_cover.jpg" />
{{end}}
```

### 3. 数据注入位置错误

```html
<!-- 错误：在 head 中注入 -->
<head>
  <script>
    window.__INITIAL_DATA__ = {{json .initialData}};
  </script>
</head>

<!-- 正确：在 body 末尾注入 -->
<body>
  ...
  <script>
    window.__INITIAL_DATA__ = {{json .initialData}};
  </script>
</body>
```

## 验证模板

使用验证脚本检查模板：

```bash
node scripts/validate-template.js
```

验证内容：

- 必需变量是否存在
- 组件定义是否完整
- **INITIAL_DATA** 是否注入
- CSS/JS 占位符是否存在

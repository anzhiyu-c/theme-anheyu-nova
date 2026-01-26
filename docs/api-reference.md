# 模板变量 API 参考

本文档列出所有可在 Go 模板中使用的变量。

## 全局变量

这些变量在所有页面中都可用。

| 变量                | 类型       | 说明                |
| ------------------- | ---------- | ------------------- |
| `.siteConfig`       | SiteConfig | 站点配置对象        |
| `.currentYear`      | int        | 当前年份（如 2026） |
| `.customHeaderHTML` | string     | 自定义头部 HTML     |
| `.customFooterHTML` | string     | 自定义页脚 HTML     |

### SiteConfig 结构

| 字段           | 类型         | 说明                 |
| -------------- | ------------ | -------------------- |
| `.SiteName`    | string       | 站点名称             |
| `.SiteUrl`     | string       | 站点 URL             |
| `.Description` | string       | 站点描述             |
| `.Author`      | string       | 作者名称             |
| `.Logo`        | string       | Logo URL             |
| `.Favicon`     | string       | Favicon URL          |
| `.ThemeColor`  | string       | 主题色（如 #3b82f6） |
| `.Menus`       | []MenuItem   | 导航菜单             |
| `.SocialLinks` | []SocialLink | 社交链接             |

### MenuItem 结构

| 字段        | 类型       | 说明           |
| ----------- | ---------- | -------------- |
| `.Name`     | string     | 菜单项名称     |
| `.URL`      | string     | 链接地址       |
| `.Icon`     | string     | 图标（可选）   |
| `.Children` | []MenuItem | 子菜单（可选） |

## 首页变量 (index.html)

| 变量                | 类型             | 说明         |
| ------------------- | ---------------- | ------------ |
| `.featuredArticles` | []ArticleSummary | 精选文章列表 |
| `.recentArticles`   | []ArticleSummary | 最近文章列表 |
| `.statistics`       | Statistics       | 统计数据     |
| `.categories`       | []Category       | 分类列表     |
| `.tags`             | []Tag            | 标签列表     |
| `.initialData`      | object           | 前端初始数据 |

### Statistics 结构

| 字段            | 类型 | 说明               |
| --------------- | ---- | ------------------ |
| `.ArticleCount` | int  | 文章总数           |
| `.WordCount`    | int  | 总字数（K 为单位） |
| `.RunningDays`  | int  | 运行天数           |

## 文章列表页变量 (posts.html)

| 变量           | 类型             | 说明                   |
| -------------- | ---------------- | ---------------------- |
| `.articles`    | []ArticleSummary | 文章列表               |
| `.pagination`  | Pagination       | 分页信息               |
| `.category`    | Category         | 当前分类（分类筛选时） |
| `.tag`         | Tag              | 当前标签（标签筛选时） |
| `.initialData` | object           | 前端初始数据           |

### Pagination 结构

| 字段          | 类型 | 说明         |
| ------------- | ---- | ------------ |
| `.Page`       | int  | 当前页码     |
| `.PageSize`   | int  | 每页数量     |
| `.Total`      | int  | 总数量       |
| `.TotalPages` | int  | 总页数       |
| `.HasNext`    | bool | 是否有下一页 |
| `.HasPrev`    | bool | 是否有上一页 |

## 文章详情页变量 (posts/**template**.html)

| 变量            | 类型             | 说明         |
| --------------- | ---------------- | ------------ |
| `.article`      | ArticleDetail    | 文章详情     |
| `.relatedPosts` | []ArticleSummary | 相关文章     |
| `.prevArticle`  | ArticleLink      | 上一篇文章   |
| `.nextArticle`  | ArticleLink      | 下一篇文章   |
| `.initialData`  | object           | 前端初始数据 |

### ArticleDetail 结构

| 字段             | 类型     | 说明                |
| ---------------- | -------- | ------------------- |
| `.ID`            | string   | 文章 ID             |
| `.Title`         | string   | 文章标题            |
| `.Slug`          | string   | 文章别名/短链接     |
| `.Excerpt`       | string   | 文章摘要            |
| `.ContentHTML`   | string   | 文章 HTML 内容      |
| `.Cover`         | string   | 封面图 URL          |
| `.PrimaryColor`  | string   | 主色调              |
| `.Keywords`      | string   | 关键词              |
| `.CreatedAt`     | string   | 创建时间 (ISO 8601) |
| `.UpdatedAt`     | string   | 更新时间 (ISO 8601) |
| `.FormattedDate` | string   | 格式化日期          |
| `.ViewCount`     | int      | 阅读数              |
| `.LikeCount`     | int      | 点赞数              |
| `.CommentCount`  | int      | 评论数              |
| `.WordCount`     | int      | 字数                |
| `.ReadingTime`   | int      | 阅读时间（分钟）    |
| `.IsTop`         | bool     | 是否置顶            |
| `.IsReprint`     | bool     | 是否转载            |
| `.Category`      | Category | 所属分类            |
| `.Tags`          | []Tag    | 标签列表            |
| `.Summaries`     | []string | AI 摘要列表         |

### ArticleSummary 结构

与 ArticleDetail 类似，但不包含 `ContentHTML`。

| 字段             | 类型     | 说明       |
| ---------------- | -------- | ---------- |
| `.ID`            | string   | 文章 ID    |
| `.Title`         | string   | 文章标题   |
| `.Slug`          | string   | 文章别名   |
| `.Excerpt`       | string   | 文章摘要   |
| `.Cover`         | string   | 封面图 URL |
| `.FormattedDate` | string   | 格式化日期 |
| `.ViewCount`     | int      | 阅读数     |
| `.ReadingTime`   | int      | 阅读时间   |
| `.Category`      | Category | 所属分类   |

### ArticleLink 结构

| 字段     | 类型   | 说明           |
| -------- | ------ | -------------- |
| `.ID`    | string | 文章 ID        |
| `.Title` | string | 文章标题       |
| `.Slug`  | string | 文章别名       |
| `.Cover` | string | 封面图（可选） |

### Category 结构

| 字段            | 类型   | 说明     |
| --------------- | ------ | -------- |
| `.ID`           | string | 分类 ID  |
| `.Name`         | string | 分类名称 |
| `.Slug`         | string | 分类别名 |
| `.Description`  | string | 分类描述 |
| `.ArticleCount` | int    | 文章数量 |

### Tag 结构

| 字段            | 类型   | 说明     |
| --------------- | ------ | -------- |
| `.ID`           | string | 标签 ID  |
| `.Name`         | string | 标签名称 |
| `.Slug`         | string | 标签别名 |
| `.ArticleCount` | int    | 文章数量 |

## 模板函数

| 函数   | 说明                   | 示例                            |
| ------ | ---------------------- | ------------------------------- |
| `json` | 将对象转为 JSON 字符串 | `{{json .initialData}}`         |
| `eq`   | 相等比较               | `{{if eq .status "published"}}` |
| `ne`   | 不等比较               | `{{if ne .status "draft"}}`     |
| `gt`   | 大于比较               | `{{if gt .count 0}}`            |
| `lt`   | 小于比较               | `{{if lt .page .totalPages}}`   |
| `add`  | 加法                   | `{{add .page 1}}`               |
| `sub`  | 减法                   | `{{sub .page 1}}`               |

## 使用示例

### 渲染文章列表

```html
{{range .articles}}
<article class="article-card" data-id="{{.ID}}">
  <a href="/posts/{{.Slug}}">
    {{if .Cover}}
    <img src="{{.Cover}}" alt="{{.Title}}" />
    {{end}}
    <h2>{{.Title}}</h2>
    <p>{{.Excerpt}}</p>
    <span>{{.FormattedDate}}</span>
  </a>
</article>
{{end}}
```

### 渲染分页

```html
{{if gt .pagination.TotalPages 1}}
<nav class="pagination">
  {{if .pagination.HasPrev}}
  <a href="/posts?page={{sub .pagination.Page 1}}">上一页</a>
  {{end}}
  <span>{{.pagination.Page}} / {{.pagination.TotalPages}}</span>
  {{if .pagination.HasNext}}
  <a href="/posts?page={{add .pagination.Page 1}}">下一页</a>
  {{end}}
</nav>
{{end}}
```

### 渲染标签

```html
{{if .article.Tags}}
<div class="tags">
  {{range .article.Tags}}
  <a href="/tags/{{.Slug}}" class="tag">#{{.Name}}</a>
  {{end}}
</div>
{{end}}
```

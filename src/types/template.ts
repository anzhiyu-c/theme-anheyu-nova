/**
 * Go 模板数据类型定义
 * 与 Go 后端的 TemplateData 结构保持一致
 * 用于 __INITIAL_DATA__ 和 React 组件
 */

// 站点配置
export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  description: string;
  author: string;
  themeColor: string;
  menus: MenuItem[];
  socialLinks?: SocialLink[];
}

export interface MenuItem {
  name: string;
  url: string;
  icon?: string;
  children?: MenuItem[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

// 分类
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
}

// 标签
export interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}

// 文章摘要（列表用）
export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover?: string;
  primaryColor?: string;
  createdAt: string;
  formattedDate: string;
  readingTime: number;
  viewCount: number;
  wordCount: number;
  category?: Category;
  tags?: Tag[];
  isTop?: boolean;
  isReprint?: boolean;
}

// 文章详情
export interface ArticleDetail extends ArticleSummary {
  content: string;
  contentHTML: string;
  summaries?: string[];
  keywords?: string;
  copyrightAuthor?: string;
  copyrightAuthorHref?: string;
  copyrightUrl?: string;
  likeCount: number;
  commentCount: number;
  prevArticle?: ArticleLink;
  nextArticle?: ArticleLink;
  relatedArticles?: ArticleSummary[];
}

// 文章链接（上一篇/下一篇）
export interface ArticleLink {
  id: string;
  title: string;
  slug: string;
  cover?: string;
}

// 分页
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 面包屑
export interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

// 首页模板数据
export interface HomeTemplateData {
  siteConfig: SiteConfig;
  featuredArticles: ArticleSummary[];
  recentArticles: ArticleSummary[];
  categories: Category[];
  tags: Tag[];
  statistics: {
    articleCount: number;
    wordCount: number;
    runningDays: number;
  };
}

// 文章列表模板数据
export interface PostsTemplateData {
  siteConfig: SiteConfig;
  articles: ArticleSummary[];
  pagination: Pagination;
  category?: Category;
  tag?: Tag;
}

// 文章详情模板数据
export interface PostDetailTemplateData {
  siteConfig: SiteConfig;
  article: ArticleDetail;
  relatedPosts: ArticleSummary[];
  prevArticle?: ArticleLink;
  nextArticle?: ArticleLink;
}

// 分类页模板数据
export interface CategoriesTemplateData {
  siteConfig: SiteConfig;
  categories: Category[];
}

// 标签页模板数据
export interface TagsTemplateData {
  siteConfig: SiteConfig;
  tags: Tag[];
}

// __INITIAL_DATA__ 类型
export type InitialData =
  | HomeTemplateData
  | PostsTemplateData
  | PostDetailTemplateData
  | CategoriesTemplateData
  | TagsTemplateData;

// Go 模板变量映射（用于文档）
export const GO_TEMPLATE_VARIABLES = {
  // 全局变量
  siteConfig: "SiteConfig",
  currentYear: "int",

  // 首页
  featuredArticles: "[]ArticleSummary",
  recentArticles: "[]ArticleSummary",
  statistics: "Statistics",

  // 文章列表
  articles: "[]ArticleSummary",
  pagination: "Pagination",

  // 文章详情
  article: "ArticleDetail",
  relatedPosts: "[]ArticleSummary",
  prevArticle: "ArticleLink",
  nextArticle: "ArticleLink",

  // 分类/标签
  categories: "[]Category",
  tags: "[]Tag",
} as const;

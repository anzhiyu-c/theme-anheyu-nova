/**
 * API 响应和数据类型定义
 */

// API 通用响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ========== 文章相关类型 ==========
// 与 anheyu-pro 后端返回的数据结构保持一致

export interface Article {
  id: string;
  title: string;
  abbrlink?: string; // 文章短链接，用于 URL
  content_md?: string;
  content_html?: string;
  cover_url: string; // 封面图
  top_img_url?: string; // 顶部大图
  primary_color?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
  view_count: number;
  word_count: number;
  reading_time: number;
  comment_count: number;
  summaries: string[]; // AI 生成的多条摘要
  post_tags: PostTag[];
  post_categories: PostCategory[];
  show_on_home: boolean;
  home_sort: number;
  pin_sort: number;
  is_primary_color_manual: boolean;
  copyright?: boolean;
  is_reprint?: boolean;
  copyright_author?: string;
  copyright_author_href?: string;
  copyright_url?: string;
  keywords?: string;
  ip_location?: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  // 发布者信息
  owner_id?: number;
  owner_nickname?: string;
  owner_avatar?: string;
  owner_email?: string;
  // 上下篇文章
  prev_article?: ArticleLink | null;
  next_article?: ArticleLink | null;
  related_articles?: ArticleLink[];
  // 全文隐藏配置（PRO 版）
  full_text_hidden_config?: {
    enabled: boolean;
    button_text?: string;
    modal_top_description?: string;
    qr_code_url?: string;
    input_placeholder?: string;
    initial_visible_height?: number;
    is_content_truncated?: boolean;
  };
  access_reason?: string;
  // 文档模式
  is_doc?: boolean;
  doc_series_id?: string;
  doc_sort?: number;
}

export interface ArticleLink {
  id: string;
  title: string;
  abbrlink: string;
  cover_url?: string;
  is_doc?: boolean;
  doc_series_id?: string;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  article_count?: number;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  article_count?: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

// 文章辅助函数 - 获取第一个分类
export function getArticleCategory(article: Article): PostCategory | undefined {
  return article.post_categories?.[0];
}

// 文章辅助函数 - 获取摘要
export function getArticleSummary(article: Article): string {
  return article.summaries?.[0] || "";
}

// 文章辅助函数 - 获取文章链接
export function getArticleSlug(article: Article): string {
  return article.abbrlink || article.id;
}

export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  category_id?: string;
  tag_id?: string;
  keyword?: string;
  status?: string;
  sort?: string;
}

export interface ArticleListResponse {
  list: Article[];
  total: number;
  page: number;
  pageSize: number;
}

// 归档摘要
export interface ArchiveSummary {
  year: number;
  month: number;
  count: number;
}

export interface ArchiveSummaryResponse {
  archives: ArchiveSummary[];
  total: number;
}

// 文章统计
export interface ArticleStatistics {
  total_articles: number;
  total_words: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  category_count: number;
  tag_count: number;
}

// ========== 分类相关类型 ==========

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cover?: string;
  icon?: string;
  color?: string;
  article_count: number;
  sort_order?: number;
  parent_id?: string;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

// ========== 标签相关类型 ==========

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  article_count: number;
  created_at: string;
  updated_at: string;
}

// ========== 评论相关类型 ==========

export interface Comment {
  id: string;
  content: string;
  article_id: string;
  parent_id?: string;
  reply_to_id?: string;
  user_id?: string;

  // 游客信息
  guest_name?: string;
  guest_email?: string;
  guest_url?: string;
  guest_avatar?: string;

  // 用户信息（已登录用户）
  user?: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
  };

  // 被回复的评论
  reply_to?: {
    id: string;
    guest_name?: string;
    user?: {
      nickname: string;
    };
  };

  // 子评论
  children?: Comment[];
  children_count?: number;

  // 统计
  like_count: number;
  is_liked?: boolean;

  // 状态
  status: "pending" | "approved" | "rejected" | "spam";
  is_author?: boolean;

  created_at: string;
  updated_at: string;
}

export interface CommentListParams {
  article_id: string;
  page?: number;
  pageSize?: number;
  parent_id?: string;
  sort?: "newest" | "oldest" | "hot";
}

export interface CommentListResponse {
  list: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCommentParams {
  article_id: string;
  content: string;
  parent_id?: string;
  reply_to_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_url?: string;
}

// ========== 网站配置相关类型 ==========
// 与 anheyu-pro 后端返回的配置结构保持一致

export interface SiteConfig {
  // 基础信息
  APP_NAME: string;
  APP_VERSION: string;
  SITE_URL: string;
  SITE_DESCRIPTION: string;
  SITE_KEYWORDS: string;
  SUB_TITLE: string;

  // Logo 和图标
  LOGO_URL: string;
  LOGO_URL_192x192: string;
  LOGO_URL_512x512: string;
  LOGO_HORIZONTAL_DAY: string;
  LOGO_HORIZONTAL_NIGHT: string;
  ICON_URL: string;

  // 用户/作者信息
  USER_AVATAR: string;
  ABOUT_LINK: string;

  // 备案信息
  ICP_NUMBER: string;
  POLICE_RECORD_NUMBER?: string;
  POLICE_RECORD_ICON?: string;

  // 主题配置
  THEME_COLOR: string;
  DEFAULT_THEME_MODE: string;

  // 图片处理参数
  DEFAULT_THUMB_PARAM: string;
  DEFAULT_BIG_PARAM: string;
  GRAVATAR_URL: string;
  DEFAULT_GRAVATAR_TYPE: string;

  // 功能开关
  ENABLE_REGISTRATION: boolean;
  ENABLE_EXTERNAL_LINK_WARNING: boolean;

  // 自定义内容
  CUSTOM_CSS: string;
  CUSTOM_JS: string;
  CUSTOM_HEADER_HTML: string;
  CUSTOM_FOOTER_HTML: string;
  SITE_ANNOUNCEMENT: string;

  // API 配置
  API_URL: string;

  // 首页配置
  HOME_TOP?: {
    title: string;
    subTitle: string;
    siteText: string;
    banner: {
      enable: boolean;
      url: string;
    };
    category: Array<{
      id: string;
      name: string;
      slug: string;
      icon: string;
    }>;
  };

  // 即刻（说说）配置
  essay?: {
    title?: string;
    subtitle?: string;
    tips?: string;
    button_text?: string;
    button_link?: string;
    limit?: number;
    home_enable?: boolean;
    top_background?: string;
  };

  // 评论配置
  comment?: {
    enable: boolean;
    blogger_email?: string;
    anonymous_email?: string;
    allow_image_upload?: boolean;
    max_image_size?: number;
    emoji_cdn?: string;
    placeholder?: string;
    gravatar_cdn?: string;
    default_avatar?: string;
  };

  // 侧边栏配置
  sidebar?: {
    author?: {
      enable?: boolean;
      description?: string;
      statusImg?: string;
      skills?: string[];
      social?: Record<string, { icon: string; link: string }>;
    };
    tags?: {
      enable?: boolean;
      highlight?: string[];
    };
    siteinfo?: {
      totalPostCount?: number;
      runtimeEnable?: boolean;
      totalWordCount?: number;
    };
  };

  // 页脚配置
  footer?: {
    owner?: {
      enable: boolean;
      since: string;
    };
    custom_text?: string;
  };

  // 文章配置
  post?: {
    copyright?: {
      enable: boolean;
      author?: string;
      license?: string;
      license_url?: string;
    };
    code_block?: {
      theme: string;
      copy: boolean;
      wrap: boolean;
    };
  };

  // 友链配置
  FRIEND_LINK_DEFAULTCATEGORY?: number;
  FRIEND_LINK_PLACEHOLDER_NAME?: string;
  FRIEND_LINK_PLACEHOLDER_URL?: string;
  FRIEND_LINK_PLACEHOLDER_LOGO?: string;
  FRIEND_LINK_PLACEHOLDER_DESCRIPTION?: string;

  // 其他配置（允许扩展）
  [key: string]: unknown;
}

export interface FriendLink {
  id: string;
  name: string;
  url: string;
  avatar: string;
  description?: string;
  category?: string;
  sort_order?: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// ========== 搜索相关类型 ==========

export interface SearchHit {
  id: string;
  title: string;
  snippet: string;
  author: string;
  category: string;
  tags: string[];
  publish_date: string;
  cover_url: string;
  abbrlink: string;
  view_count: number;
  word_count: number;
  reading_time: number;
  is_doc?: boolean;
  doc_series_id?: string;
}

export interface SearchPagination {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface SearchResult {
  pagination: SearchPagination;
  hits: SearchHit[];
}

export interface SearchParams {
  q: string;
  page?: number;
  size?: number;
}

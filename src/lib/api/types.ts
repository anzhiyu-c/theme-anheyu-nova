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
  slug?: string;
  color?: string;
  count?: number;
}

export interface PostCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  count?: number;
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

// 分类统计项
export interface CategoryStatItem {
  name: string;
  count: number;
}

// 标签统计项
export interface TagStatItem {
  name: string;
  count: number;
}

// 热门文章项
export interface TopViewedPostItem {
  id: string;
  title: string;
  views: number;
  cover_url?: string;
}

// 发布趋势项
export interface PublishTrendItem {
  month: string;
  count: number;
}

// 文章统计（匹配后端 model.ArticleStatistics）
export interface ArticleStatistics {
  total_posts: number; // 文章总数
  total_words: number; // 总字数
  avg_words: number; // 平均字数
  total_views: number; // 总浏览量
  category_stats: CategoryStatItem[]; // 分类统计
  tag_stats: TagStatItem[]; // 标签统计
  top_viewed_posts: TopViewedPostItem[]; // 热门文章
  publish_trend: PublishTrendItem[]; // 发布趋势
}

// ========== 分类相关类型 ==========

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  cover?: string;
  icon?: string;
  color?: string;
  count: number; // 后端返回的字段名是 count
  is_series?: boolean;
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
  slug?: string;
  color?: string;
  description?: string;
  count: number; // 后端返回的字段名是 count
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

  // 关于页面配置
  about?: AboutPageConfig;

  // 首页技能/创造力模块配置
  creativity?: CreativityConfig;

  // 其他配置（允许扩展）
  [key: string]: unknown;
}

// ========== 关于页面配置类型 ==========

/**
 * 关于页面完整配置
 * 对应后端 about.page.* 配置项
 */
export interface AboutPageConfig {
  // 基础信息
  name?: string; // about.page.name
  description?: string; // about.page.description
  avatarImg?: string; // about.page.avatar_img
  subtitle?: string; // about.page.subtitle
  avatarSkillsLeft?: string[]; // about.page.avatar_skills_left
  avatarSkillsRight?: string[]; // about.page.avatar_skills_right

  // 关于网站提示
  aboutSiteTips?: AboutSiteTips; // about.page.about_site_tips

  // 统计背景
  statisticsBackground?: string; // about.page.statistics_background

  // 地图信息
  map?: AboutMapConfig; // about.page.map

  // 个人信息
  selfInfo?: AboutSelfInfo; // about.page.self_info

  // 性格信息
  personalities?: AboutPersonalities; // about.page.personalities

  // 格言
  maxim?: AboutMaxim; // about.page.maxim

  // 特长/增益
  buff?: AboutBuff; // about.page.buff

  // 游戏信息
  game?: AboutGame; // about.page.game

  // 番剧/漫画
  comic?: AboutComic; // about.page.comic

  // 技术偏好
  like?: AboutLike; // about.page.like

  // 音乐偏好
  music?: AboutMusic; // about.page.music

  // 职业经历
  careers?: AboutCareers; // about.page.careers

  // 技能提示
  skillsTips?: AboutSkillsTips; // about.page.skills_tips

  // 技能组配置（进度条形式）
  skillGroups?: AboutSkillGroup[]; // about.page.skill_groups

  // 自定义内容
  customCode?: string; // about.page.custom_code (Markdown)
  customCodeHtml?: string; // about.page.custom_code_html (HTML)

  // 板块开关配置
  enable?: AboutPageEnableConfig;
}

/**
 * 关于网站提示配置
 */
export interface AboutSiteTips {
  tips?: string;
  title1?: string;
  title2?: string;
  word?: string[];
}

/**
 * 地图配置
 */
export interface AboutMapConfig {
  title?: string;
  strengthenTitle?: string;
  background?: string;
  backgroundDark?: string;
}

/**
 * 个人信息配置
 */
export interface AboutSelfInfo {
  tips1?: string;
  contentYear?: string;
  tips2?: string;
  content2?: string;
  tips3?: string;
  content3?: string;
}

/**
 * 性格信息配置
 */
export interface AboutPersonalities {
  tips?: string;
  authorName?: string;
  personalityType?: string;
  personalityTypeColor?: string;
  personalityImg?: string;
  nameUrl?: string;
  photoUrl?: string;
}

/**
 * 格言配置
 */
export interface AboutMaxim {
  tips?: string;
  top?: string;
  bottom?: string;
}

/**
 * 特长/增益配置
 */
export interface AboutBuff {
  tips?: string;
  top?: string;
  bottom?: string;
}

/**
 * 游戏信息配置
 */
export interface AboutGame {
  tips?: string;
  title?: string;
  uid?: string;
  background?: string;
}

/**
 * 番剧/漫画配置
 */
export interface AboutComic {
  tips?: string;
  title?: string;
  list?: Array<{
    name: string;
    cover: string;
    href?: string;
  }>;
}

/**
 * 技术偏好配置
 */
export interface AboutLike {
  tips?: string;
  title?: string;
  bottom?: string;
  background?: string;
}

/**
 * 音乐偏好配置
 */
export interface AboutMusic {
  tips?: string;
  title?: string;
  link?: string;
  background?: string;
}

/**
 * 职业经历配置
 */
export interface AboutCareers {
  tips?: string;
  title?: string;
  img?: string;
  list?: Array<{
    year?: string;
    title?: string;
    company?: string;
    desc?: string;
    color?: string;
  }>;
}

/**
 * 技能提示配置
 */
export interface AboutSkillsTips {
  tips?: string;
  title?: string;
}

/**
 * 技能组配置（进度条形式）
 */
export interface AboutSkillGroup {
  category: string;
  icon?: string; // 图标名称或类名
  color?: string; // 渐变色，如 "from-blue-500 to-cyan-500"
  items: Array<{
    name: string;
    level: number; // 0-100 百分比
  }>;
}

/**
 * 关于页面板块开关配置
 */
export interface AboutPageEnableConfig {
  authorBox?: boolean; // 作者头像框板块
  pageContent?: boolean; // 基础介绍内容板块
  skills?: boolean; // 技能卡片板块
  careers?: boolean; // 职业经历卡片板块
  statistic?: boolean; // 访问统计卡片板块
  mapAndInfo?: boolean; // 地图和个人信息卡片板块
  personality?: boolean; // 性格卡片板块
  photo?: boolean; // 照片卡片板块
  maxim?: boolean; // 格言卡片板块
  buff?: boolean; // 特长卡片板块
  game?: boolean; // 游戏卡片板块
  comic?: boolean; // 漫画/番剧卡片板块
  likeTech?: boolean; // 技术偏好卡片板块
  music?: boolean; // 音乐卡片板块
  customCode?: boolean; // 自定义内容块
  comment?: boolean; // 评论板块
}

/**
 * 首页技能/创造力模块配置
 */
export interface CreativityConfig {
  title?: string;
  subtitle?: string;
  creativity_list?: Array<{
    name: string;
    color?: string;
    icon?: string;
  }>;
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

// ========== 主题配置类型 ==========

/**
 * Nova 主题配置
 * 对应 theme.json 中的 settings 字段定义
 * 通过 /api/public/theme/config 获取
 */
export interface NovaThemeConfig {
  // 关于页面配置
  "about.showSkills"?: boolean;
  "about.showCareers"?: boolean;
  "about.showTechTags"?: boolean;
  "about.skillsTitle"?: string;
  "about.skillsTips"?: string;
  "about.careersTitle"?: string;
  "about.careersTips"?: string;
  "about.skillGroups"?: string; // JSON 字符串
  "about.careers"?: string; // JSON 字符串
  "about.techTags"?: string; // 逗号分隔

  // 首页配置
  "homepage.heroStyle"?: "default" | "minimal" | "fullscreen";
  "homepage.showRecentPosts"?: boolean;
  "homepage.postsCount"?: number;

  // 文章页面配置
  "article.showToc"?: boolean;
  "article.showAuthor"?: boolean;
  "article.showRelated"?: boolean;
  "article.codeTheme"?: string;
}

/**
 * 解析后的关于页面主题配置
 */
export interface AboutThemeConfig {
  showSkills: boolean;
  showCareers: boolean;
  showTechTags: boolean;
  skillsTitle: string;
  skillsTips: string;
  careersTitle: string;
  careersTips: string;
  skillGroups: AboutSkillGroup[];
  careers: AboutCareerItem[];
  techTags: string[];
}

/**
 * 职业经历项（主题配置版）
 */
export interface AboutCareerItem {
  year: string;
  title: string;
  company: string;
  description: string;
  icon: string;
  color: string;
}

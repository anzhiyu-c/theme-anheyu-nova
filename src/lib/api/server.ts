/**
 * 服务端 API 调用函数
 * 用于 Server Components 和 generateMetadata
 *
 * SSR 模式下直接调用 Go API，支持缓存和按需清理
 * Go 后端更新数据时调用 /api/revalidate 清理缓存
 */
import type {
  ApiResponse,
  Article,
  ArticleListParams,
  ArticleListResponse,
  ArticleStatistics,
  ArchiveSummaryResponse,
  Category,
  Tag,
  SiteConfig,
  FriendLink,
  SearchResult,
} from "./types";

// ========== 配置 ==========

/**
 * 获取后端 API URL
 * 优先级：API_URL 环境变量 > BACKEND_URL 环境变量 > 默认值
 */
function getApiUrl(): string {
  // SSR 运行时使用 API_URL（Docker 内部网络）
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  // 开发环境后备
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  // 默认值
  return "http://localhost:8091";
}

/**
 * 获取站点 URL（用于 Referer 头信息）
 */
function getSiteUrl(): string {
  // 优先使用 NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // 使用 API_URL 作为备选
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  return "http://localhost:3003";
}

/**
 * 通用 fetch 包装器
 * 支持 Next.js ISR 缓存策略
 */
async function serverFetch<T>(
  endpoint: string,
  options: {
    revalidate?: number | false; // ISR 重新验证时间（秒），false 表示不缓存
    tags?: string[]; // 缓存标签，用于按需重新验证
    params?: Record<string, string | number | boolean | undefined>;
  } = {}
): Promise<T | null> {
  const { revalidate = 0, tags, params } = options;
  const apiUrl = getApiUrl();
  const siteUrl = getSiteUrl();

  // 构建查询参数
  let url = `${apiUrl}/api${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  try {
    const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      headers: {
        "Content-Type": "application/json",
        // 添加 Referer 和 Origin 头信息，用于后端域名验证
        Referer: siteUrl,
        Origin: siteUrl,
      },
    };

    // 配置 ISR 缓存策略
    if (revalidate !== undefined) {
      fetchOptions.next = { revalidate };
      if (tags) {
        fetchOptions.next.tags = tags;
      }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error(`[Server API] Failed: ${endpoint} - Status: ${response.status}`);
      return null;
    }

    const data: ApiResponse<T> = await response.json();

    // 后端成功码是 200
    if (data.code !== 200) {
      console.error(`[Server API] Error: ${endpoint} - ${data.message}`);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error(`[Server API] Exception: ${endpoint}`, error);
    return null;
  }
}

// ========== 网站配置 ==========

/**
 * 获取网站配置
 * 缓存 1 小时，配置变更时通过 /api/revalidate 清理
 */
export async function getSiteConfig(): Promise<SiteConfig | null> {
  return serverFetch<SiteConfig>("/public/site-config", {
    revalidate: 3600,
    tags: ["site-config"],
  });
}

/**
 * 默认站点配置（用于 fallback）
 */
export const defaultSiteConfig: Partial<SiteConfig> = {
  APP_NAME: "安和鱼",
  APP_VERSION: "1.0.0",
  SITE_URL: "",
  SITE_DESCRIPTION: "探索思想的边界，记录每一个灵感",
  SITE_KEYWORDS: "博客,技术,生活,思考",
  SUB_TITLE: "生活明朗，万物可爱",
  LOGO_URL: "/logo.svg",
  LOGO_URL_192x192: "/static/img/logo-192x192.png",
  LOGO_URL_512x512: "/static/img/logo-512x512.png",
  LOGO_HORIZONTAL_DAY: "/static/img/logo-horizontal-day.png",
  LOGO_HORIZONTAL_NIGHT: "/static/img/logo-horizontal-night.png",
  ICON_URL: "/favicon.ico",
  USER_AVATAR: "/static/img/avatar.jpg",
  ABOUT_LINK: "/about",
  ICP_NUMBER: "",
  THEME_COLOR: "#10b981",
  DEFAULT_THEME_MODE: "light",
  DEFAULT_THUMB_PARAM: "",
  DEFAULT_BIG_PARAM: "",
  GRAVATAR_URL: "https://cravatar.cn/",
  DEFAULT_GRAVATAR_TYPE: "mp",
  ENABLE_REGISTRATION: true,
  ENABLE_EXTERNAL_LINK_WARNING: false,
  CUSTOM_CSS: "",
  CUSTOM_JS: "",
  CUSTOM_HEADER_HTML: "",
  CUSTOM_FOOTER_HTML: "",
  SITE_ANNOUNCEMENT: "",
  API_URL: "/",
};

// ========== 文章 API ==========

/**
 * 获取文章列表
 * 缓存 60 秒，文章变更时通过 /api/revalidate 清理
 */
export async function getArticles(params?: ArticleListParams): Promise<ArticleListResponse | null> {
  return serverFetch<ArticleListResponse>("/public/articles", {
    revalidate: 60,
    tags: ["articles"],
    params: params as Record<string, string | number | undefined>,
  });
}

/**
 * 获取首页推荐文章
 * 缓存 60 秒，文章变更时通过 /api/revalidate 清理
 */
export async function getHomeArticles(): Promise<Article[] | null> {
  return serverFetch<Article[]>("/public/articles/home", {
    revalidate: 60,
    tags: ["articles", "home"],
  });
}

/**
 * 获取文章详情
 * 缓存 60 秒，文章变更时通过 /api/revalidate 清理
 */
export async function getArticleBySlug(slug: string, fullTextToken?: string): Promise<Article | null> {
  return serverFetch<Article>(`/pro/articles/${slug}/content`, {
    revalidate: 60,
    tags: ["articles", `article-${slug}`],
    params: fullTextToken ? { full_text_token: fullTextToken } : undefined,
  });
}

/**
 * 获取文章归档
 * 缓存 5 分钟，文章变更时通过 /api/revalidate 清理
 */
export async function getArticleArchives(): Promise<ArchiveSummaryResponse | null> {
  return serverFetch<ArchiveSummaryResponse>("/public/articles/archives", {
    revalidate: 300,
    tags: ["archives"],
  });
}

/**
 * 获取文章统计
 * 缓存 5 分钟，文章变更时通过 /api/revalidate 清理
 */
export async function getArticleStatistics(): Promise<ArticleStatistics | null> {
  return serverFetch<ArticleStatistics>("/public/articles/statistics", {
    revalidate: 300,
    tags: ["statistics"],
  });
}

/**
 * 获取所有文章 slug（用于 generateStaticParams）
 * 缓存 5 分钟
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  // 获取足够多的文章以覆盖大部分静态生成需求
  const result = await serverFetch<ArticleListResponse>("/public/articles", {
    revalidate: 300,
    tags: ["articles"],
    params: { pageSize: 1000, status: "PUBLISHED" },
  });

  if (!result?.list) {
    return [];
  }

  return result.list.map(article => article.abbrlink || article.id);
}

// ========== 分类 API ==========

/**
 * 获取所有分类
 * ISR: 10 分钟重新验证
 */
export async function getCategories(): Promise<Category[] | null> {
  return serverFetch<Category[]>("/post-categories", {
    revalidate: 600,
    tags: ["categories"],
  });
}

/**
 * 根据 slug 获取分类
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return serverFetch<Category>(`/post-categories/slug/${slug}`, {
    revalidate: 600,
    tags: ["categories", `category-${slug}`],
  });
}

// ========== 标签 API ==========

/**
 * 获取所有标签
 * ISR: 10 分钟重新验证
 */
export async function getTags(sort?: "count" | "name"): Promise<Tag[] | null> {
  return serverFetch<Tag[]>("/post-tags", {
    revalidate: 600,
    tags: ["tags"],
    params: { sort: sort || "count" },
  });
}

/**
 * 根据 slug 获取标签
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return serverFetch<Tag>(`/post-tags/slug/${slug}`, {
    revalidate: 600,
    tags: ["tags", `tag-${slug}`],
  });
}

// ========== 评论 API ==========

/**
 * 获取评论总数
 * 缓存 5 分钟
 */
export async function getCommentCount(): Promise<number> {
  const result = await serverFetch<{ total: number }>("/public/comments/latest", {
    revalidate: 300,
    tags: ["comments"],
    params: { page: 1, pageSize: 1 }, // 只获取总数，不需要实际数据
  });
  return result?.total || 0;
}

// ========== 友链 API ==========

/**
 * 获取友情链接
 * ISR: 1 小时重新验证
 */
export async function getFriendLinks(): Promise<FriendLink[] | null> {
  return serverFetch<FriendLink[]>("/public/friend-links", {
    revalidate: 3600,
    tags: ["friend-links"],
  });
}

// ========== 搜索 API ==========

/**
 * 搜索文章（服务端）
 * 不缓存搜索结果
 */
export async function searchArticles(query: string, page = 1, size = 10): Promise<SearchResult | null> {
  return serverFetch<SearchResult>("/search", {
    revalidate: false, // 搜索结果不缓存
    params: { q: query, page, size },
  });
}

// ========== 主题配置 API ==========

import type { NovaThemeConfig, AboutThemeConfig, AboutSkillGroup, AboutCareerItem } from "./types";

/**
 * 获取主题配置
 * ISR: 5 分钟重新验证
 */
export async function getThemeConfig(): Promise<NovaThemeConfig | null> {
  return serverFetch<NovaThemeConfig>("/public/theme/config", {
    revalidate: 300,
    tags: ["theme-config"],
  });
}

/**
 * 解析关于页面主题配置
 * 将原始配置转换为结构化数据
 */
export function parseAboutThemeConfig(config: NovaThemeConfig | null): AboutThemeConfig {
  // 默认技能组数据
  const defaultSkillGroups: AboutSkillGroup[] = [
    {
      category: "前端开发",
      icon: "Code2",
      color: "from-blue-500 to-cyan-500",
      items: [
        { name: "React / Next.js", level: 95 },
        { name: "Vue / Nuxt", level: 90 },
        { name: "TypeScript", level: 92 },
        { name: "Tailwind CSS", level: 95 },
      ],
    },
    {
      category: "后端开发",
      icon: "Terminal",
      color: "from-emerald-500 to-teal-500",
      items: [
        { name: "Go / Gin", level: 88 },
        { name: "Node.js", level: 85 },
        { name: "Python", level: 80 },
        { name: "Rust", level: 70 },
      ],
    },
    {
      category: "数据库 & 缓存",
      icon: "Database",
      color: "from-orange-500 to-amber-500",
      items: [
        { name: "PostgreSQL", level: 90 },
        { name: "MySQL", level: 88 },
        { name: "Redis", level: 85 },
        { name: "MongoDB", level: 75 },
      ],
    },
    {
      category: "云服务 & DevOps",
      icon: "Cloud",
      color: "from-purple-500 to-pink-500",
      items: [
        { name: "Docker", level: 90 },
        { name: "Kubernetes", level: 80 },
        { name: "AWS / 阿里云", level: 85 },
        { name: "CI/CD", level: 88 },
      ],
    },
  ];

  // 默认职业经历数据
  const defaultCareers: AboutCareerItem[] = [
    {
      year: "2024",
      title: "全栈架构师",
      company: "独立开发者",
      description: "专注于开源项目和技术分享，打造高质量的博客系统和开发工具。",
      icon: "Rocket",
      color: "bg-gradient-to-r from-primary to-primary-400",
    },
    {
      year: "2022",
      title: "高级前端工程师",
      company: "某科技公司",
      description: "负责公司核心产品的前端架构设计与性能优化，带领团队完成多个重要项目。",
      icon: "Layers",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      year: "2020",
      title: "前端开发工程师",
      company: "某互联网公司",
      description: "参与多个大型项目开发，从0到1构建企业级中后台系统。",
      icon: "GitBranch",
      color: "bg-gradient-to-r from-emerald-500 to-teal-500",
    },
    {
      year: "2018",
      title: "初入编程世界",
      company: "大学时期",
      description: "开始学习编程，从第一行代码到第一个完整项目，开启了技术探索之旅。",
      icon: "BookOpen",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
  ];

  // 默认技术标签
  const defaultTechTags = [
    "React",
    "Vue",
    "Next.js",
    "Nuxt",
    "TypeScript",
    "Go",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "Tailwind CSS",
    "GraphQL",
    "REST API",
    "微服务",
    "CI/CD",
    "云原生",
    "性能优化",
  ];

  if (!config) {
    return {
      showSkills: true,
      showCareers: true,
      showTechTags: true,
      skillsTitle: "技术栈",
      skillsTips: "多年的开发经验让我掌握了丰富的技术栈，能够应对各种复杂的项目需求",
      careersTitle: "我的经历",
      careersTips: "每一步都是成长，每一次挑战都是机遇",
      skillGroups: defaultSkillGroups,
      careers: defaultCareers,
      techTags: defaultTechTags,
    };
  }

  // 解析技能组 JSON
  let skillGroups = defaultSkillGroups;
  if (config["about.skillGroups"]) {
    try {
      skillGroups = JSON.parse(config["about.skillGroups"]);
    } catch {
      console.warn("Failed to parse about.skillGroups, using default");
    }
  }

  // 解析职业经历 JSON
  let careers = defaultCareers;
  if (config["about.careers"]) {
    try {
      careers = JSON.parse(config["about.careers"]);
    } catch {
      console.warn("Failed to parse about.careers, using default");
    }
  }

  // 解析技术标签
  let techTags = defaultTechTags;
  if (config["about.techTags"]) {
    techTags = config["about.techTags"]
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return {
    showSkills: config["about.showSkills"] !== false,
    showCareers: config["about.showCareers"] !== false,
    showTechTags: config["about.showTechTags"] !== false,
    skillsTitle: config["about.skillsTitle"] || "技术栈",
    skillsTips: config["about.skillsTips"] || "多年的开发经验让我掌握了丰富的技术栈，能够应对各种复杂的项目需求",
    careersTitle: config["about.careersTitle"] || "我的经历",
    careersTips: config["about.careersTips"] || "每一步都是成长，每一次挑战都是机遇",
    skillGroups,
    careers,
    techTags,
  };
}

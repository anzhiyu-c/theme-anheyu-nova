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

  return result.list.map((article) => article.abbrlink || article.id);
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
export async function searchArticles(
  query: string,
  page = 1,
  size = 10
): Promise<SearchResult | null> {
  return serverFetch<SearchResult>("/search", {
    revalidate: false, // 搜索结果不缓存
    params: { q: query, page, size },
  });
}

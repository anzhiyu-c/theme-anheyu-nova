/*
 * @Description: 初始数据注入处理（已弃用）
 * @Author: 安知鱼
 * @Date: 2026-01-23 18:38:09
 * @LastEditTime: 2026-01-26 01:15:54
 * @LastEditors: 安知鱼
 */

/**
 * @deprecated 此模块用于伪 SSR（Go 模板 + React Hydration）模式
 *
 * SSR 模式说明：
 * - theme-anheyu-nova 已改为使用真正的 Next.js SSR
 * - 数据通过 Server Components 直接获取，不再需要 window.__INITIAL_DATA__
 * - 此文件保留仅为向后兼容，不推荐在新代码中使用
 *
 * 如需使用伪 SSR 模式，请参考 anheyu-app 的静态主题支持
 */

// 文章链接类型（用于上一篇/下一篇/相关文章）
export interface ArticleLinkData {
  ID: string;
  Title: string;
  Abbrlink: string;
  CoverURL?: string;
  IsDoc?: boolean;
  DocSeriesID?: string;
}

// 定义文章数据类型（与 Go 后端响应格式匹配）
export interface InitialArticleData {
  ID?: string;
  Title?: string;
  Slug?: string;
  ContentHTML?: string;
  Summaries?: string[];
  CoverURL?: string;
  PrimaryColor?: string;
  Status?: string;
  IsTop?: boolean;
  IsReprint?: boolean;
  ViewCount?: number;
  LikeCount?: number;
  CommentCount?: number;
  WordCount?: number;
  ReadingTime?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  PublishedAt?: string;
  Keywords?: string;
  CopyrightAuthor?: string;
  PostCategory?: {
    ID: string;
    Name: string;
    Slug: string;
  };
  PostTags?: Array<{
    ID: string;
    Name: string;
    Slug: string;
  }>;
  PrevArticle?: ArticleLinkData | null;
  NextArticle?: ArticleLinkData | null;
  RelatedArticles?: ArticleLinkData[];
}

export interface InitialData {
  data?: InitialArticleData;
  __timestamp__?: number;
}

/**
 * 获取 Go 后端注入的初始数据
 * 在 SSR 场景下，Go 后端会在 HTML 中注入 window.__INITIAL_DATA__
 */
export function getInitialData(): InitialData | null {
  if (typeof window === "undefined") {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialData = (window as any).__INITIAL_DATA__;

  if (!initialData) {
    return null;
  }

  return initialData as InitialData;
}

/**
 * React Hook: 获取初始数据
 * 使用 useMemo 缓存结果，避免重复计算
 */
export function useInitialData(): InitialData | null {
  // 使用 useMemo 确保在组件生命周期内只计算一次
  // 注意：不能在 SSR 时使用 useMemo，因为 window 不存在
  if (typeof window === "undefined") {
    return null;
  }

  return getInitialData();
}

/**
 * React Hook: 获取站点配置
 * 从 window.__SITE_CONFIG__ 读取
 */
export function useSiteConfig(): SiteConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__SITE_CONFIG__ || null;
}

// 站点配置类型
export interface SiteConfig {
  siteName?: string;
  siteUrl?: string;
  logo?: string;
  favicon?: string;
  description?: string;
  author?: string;
  menus?: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
}

/**
 * 清除初始数据（用于客户端导航后）
 */
export function clearInitialData(): void {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__INITIAL_DATA__ = null;
  }
}

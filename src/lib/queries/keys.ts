/**
 * TanStack Query Keys
 * 统一管理所有查询的 key，方便缓存管理和失效
 */

import type { ArticleListParams, CommentListParams } from "@/lib/api/types";

export const queryKeys = {
  // 文章相关
  articles: {
    all: ["articles"] as const,
    lists: () => [...queryKeys.articles.all, "list"] as const,
    list: (params?: ArticleListParams) => [...queryKeys.articles.lists(), params] as const,
    details: () => [...queryKeys.articles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.articles.details(), id] as const,
    home: () => [...queryKeys.articles.all, "home"] as const,
    random: () => [...queryKeys.articles.all, "random"] as const,
    archives: () => [...queryKeys.articles.all, "archives"] as const,
    statistics: () => [...queryKeys.articles.all, "statistics"] as const,
  },

  // 分类相关
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    detail: (id: string) => [...queryKeys.categories.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.categories.all, "slug", slug] as const,
  },

  // 标签相关
  tags: {
    all: ["tags"] as const,
    list: (sort?: "count" | "name") => [...queryKeys.tags.all, "list", sort] as const,
    detail: (id: string) => [...queryKeys.tags.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.tags.all, "slug", slug] as const,
  },

  // 评论相关
  comments: {
    all: ["comments"] as const,
    list: (params: CommentListParams) => [...queryKeys.comments.all, "list", params] as const,
    children: (commentId: string) => [...queryKeys.comments.all, "children", commentId] as const,
    recent: (limit?: number) => [...queryKeys.comments.all, "recent", limit] as const,
  },

  // 网站配置相关
  site: {
    all: ["site"] as const,
    config: () => [...queryKeys.site.all, "config"] as const,
    friendLinks: () => [...queryKeys.site.all, "friendLinks"] as const,
  },

  // 搜索相关
  search: {
    all: ["search"] as const,
    query: (q: string, page: number, size: number) => [...queryKeys.search.all, q, page, size] as const,
  },
};

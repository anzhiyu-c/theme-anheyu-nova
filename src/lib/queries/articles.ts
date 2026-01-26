/**
 * 文章相关 TanStack Query Hooks
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api/services";
import { queryKeys } from "./keys";
import type { ArticleListParams } from "@/lib/api/types";

/**
 * 获取文章列表
 */
export function useArticles(params?: ArticleListParams) {
  return useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: async () => {
      const response = await articlesApi.getList(params);
      if (response.code !== 200) {
        throw new Error(response.message || "获取文章列表失败");
      }
      return response.data;
    },
  });
}

/**
 * 获取文章详情
 */
export function useArticle(id: string, fullTextToken?: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(id),
    queryFn: async () => {
      const response = await articlesApi.getDetail(id, fullTextToken);
      if (response.code !== 200) {
        throw new Error(response.message || "获取文章详情失败");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * 获取首页推荐文章
 */
export function useHomeArticles() {
  return useQuery({
    queryKey: queryKeys.articles.home(),
    queryFn: async () => {
      const response = await articlesApi.getHomeArticles();
      if (response.code !== 200) {
        throw new Error(response.message || "获取首页文章失败");
      }
      return response.data;
    },
  });
}

/**
 * 获取随机文章
 */
export function useRandomArticle() {
  return useQuery({
    queryKey: queryKeys.articles.random(),
    queryFn: async () => {
      const response = await articlesApi.getRandomArticle();
      if (response.code !== 200) {
        throw new Error(response.message || "获取随机文章失败");
      }
      return response.data;
    },
    // 不自动重新获取，需要手动触发
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * 获取文章归档
 */
export function useArticleArchives() {
  return useQuery({
    queryKey: queryKeys.articles.archives(),
    queryFn: async () => {
      const response = await articlesApi.getArchives();
      if (response.code !== 200) {
        throw new Error(response.message || "获取文章归档失败");
      }
      return response.data;
    },
  });
}

/**
 * 获取文章统计
 */
export function useArticleStatistics() {
  return useQuery({
    queryKey: queryKeys.articles.statistics(),
    queryFn: async () => {
      const response = await articlesApi.getStatistics();
      if (response.code !== 200) {
        throw new Error(response.message || "获取文章统计失败");
      }
      return response.data;
    },
  });
}

/**
 * 点赞文章
 */
export function useLikeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.like(id),
    onSuccess: (_data: unknown, id: string) => {
      // 点赞成功后，使文章详情缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(id) });
      // 同时使列表缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() });
    },
  });
}

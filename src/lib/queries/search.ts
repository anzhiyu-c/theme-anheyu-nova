/**
 * 搜索相关 TanStack Query Hooks
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/services";
import { queryKeys } from "./keys";

/**
 * 搜索文章
 * @param query 搜索关键词
 * @param page 页码
 * @param size 每页数量
 */
export function useSearch(query: string, page: number = 1, size: number = 10) {
  return useQuery({
    queryKey: queryKeys.search.query(query, page, size),
    queryFn: async () => {
      if (!query.trim()) {
        return null;
      }
      const response = await searchApi.search({ q: query, page, size });
      if (response.code !== 200) {
        throw new Error(response.message || "搜索失败");
      }
      return response.data;
    },
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 5, // 5分钟内不重新请求
  });
}

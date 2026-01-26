/**
 * 标签相关 TanStack Query Hooks
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api/services";
import { queryKeys } from "./keys";

/**
 * 获取标签列表
 */
export function useTags(sort?: "count" | "name") {
  return useQuery({
    queryKey: queryKeys.tags.list(sort),
    queryFn: async () => {
      const response = await tagsApi.getList(sort);
      if (response.code !== 200) {
        throw new Error(response.message || "获取标签列表失败");
      }
      return response.data;
    },
  });
}

/**
 * 获取单个标签
 */
export function useTag(id: string) {
  return useQuery({
    queryKey: queryKeys.tags.detail(id),
    queryFn: async () => {
      const response = await tagsApi.getById(id);
      if (response.code !== 200) {
        throw new Error(response.message || "获取标签详情失败");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * 根据 slug 获取标签
 */
export function useTagBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.tags.slug(slug),
    queryFn: async () => {
      const response = await tagsApi.getBySlug(slug);
      if (response.code !== 200) {
        throw new Error(response.message || "获取标签详情失败");
      }
      return response.data;
    },
    enabled: !!slug,
  });
}

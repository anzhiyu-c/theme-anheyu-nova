/**
 * 分类相关 TanStack Query Hooks
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/services";
import { queryKeys } from "./keys";

/**
 * 获取分类列表
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const response = await categoriesApi.getList();
      if (response.code !== 200) {
        throw new Error(response.message || "获取分类列表失败");
      }
      return response.data;
    },
  });
}

/**
 * 获取单个分类
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async () => {
      const response = await categoriesApi.getById(id);
      if (response.code !== 200) {
        throw new Error(response.message || "获取分类详情失败");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * 根据 slug 获取分类
 */
export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.slug(slug),
    queryFn: async () => {
      const response = await categoriesApi.getBySlug(slug);
      if (response.code !== 200) {
        throw new Error(response.message || "获取分类详情失败");
      }
      return response.data;
    },
    enabled: !!slug,
  });
}

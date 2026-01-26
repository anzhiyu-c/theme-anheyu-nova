/**
 * 网站配置相关 TanStack Query Hooks
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteApi } from "@/lib/api/services";
import { queryKeys } from "./keys";
import type { FriendLink } from "@/lib/api/types";

/**
 * 获取网站配置
 */
export function useSiteConfig() {
  return useQuery({
    queryKey: queryKeys.site.config(),
    queryFn: async () => {
      const response = await siteApi.getConfig();
      if (response.code !== 200) {
        throw new Error(response.message || "获取网站配置失败");
      }
      console.log("[SiteConfig] 站点配置加载成功:", response.data);
      return response.data;
    },
    // 站点配置缓存时间长一些
    staleTime: 10 * 60 * 1000, // 10 分钟
    gcTime: 60 * 60 * 1000, // 1 小时
  });
}

/**
 * 获取友情链接
 */
export function useFriendLinks() {
  return useQuery({
    queryKey: queryKeys.site.friendLinks(),
    queryFn: async () => {
      const response = await siteApi.getFriendLinks();
      if (response.code !== 200) {
        throw new Error(response.message || "获取友情链接失败");
      }
      return response.data;
    },
  });
}

/**
 * 申请友情链接
 */
export function useApplyFriendLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FriendLink, "id" | "status" | "created_at">) => siteApi.applyFriendLink(data),
    onSuccess: () => {
      // 申请成功后，使友情链接缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.site.friendLinks() });
    },
  });
}

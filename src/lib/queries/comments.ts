/**
 * 评论相关 TanStack Query Hooks
 */
"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api/services";
import { queryKeys } from "./keys";
import type { CommentListParams, CommentListResponse, CreateCommentParams } from "@/lib/api/types";

/**
 * 获取评论列表
 */
export function useComments(params: CommentListParams) {
  return useQuery({
    queryKey: queryKeys.comments.list(params),
    queryFn: async () => {
      const response = await commentsApi.getList(params);
      if (response.code !== 200) {
        throw new Error(response.message || "获取评论列表失败");
      }
      return response.data;
    },
    enabled: !!params.article_id,
  });
}

/**
 * 获取评论子评论（支持无限加载）
 */
export function useCommentChildren(commentId: string, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments.children(commentId),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await commentsApi.getChildren(commentId, pageParam, pageSize);
      if (response.code !== 200) {
        throw new Error(response.message || "获取子评论失败");
      }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: CommentListResponse) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    enabled: !!commentId,
  });
}

/**
 * 获取最新评论
 */
export function useRecentComments(limit?: number) {
  return useQuery({
    queryKey: queryKeys.comments.recent(limit),
    queryFn: async () => {
      const response = await commentsApi.getRecent(limit);
      if (response.code !== 200) {
        throw new Error(response.message || "获取最新评论失败");
      }
      return response.data;
    },
  });
}

/**
 * 发表评论
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentParams) => commentsApi.create(data),
    onSuccess: (_data: unknown, variables: CreateCommentParams) => {
      // 发表评论成功后，使评论列表缓存失效
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list({ article_id: variables.article_id }),
      });
      // 同时使最新评论缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}

/**
 * 点赞评论
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentsApi.like(id),
    onSuccess: () => {
      // 点赞成功后，使所有评论缓存失效
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}

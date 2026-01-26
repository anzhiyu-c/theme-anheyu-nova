/**
 * Hooks 导出
 *
 * 使用 TanStack Query 管理 server state
 * 从 @/lib/queries 重新导出，保持原有 API 兼容
 */

import { useState, useEffect } from "react";

/**
 * useHydrated - 检测客户端 hydration 是否完成
 *
 * 在 SSR/SSG 场景下，这个 hook 返回 false
 * 在客户端 hydration 完成后返回 true
 *
 * 用于解决 framer-motion 动画在静态导出时的问题：
 * - 服务端渲染时，动画组件会输出 opacity: 0 的内联样式
 * - 如果 JS hydration 失败，元素会保持不可见
 * - 使用这个 hook 可以让组件在 hydration 之前保持可见
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

export {
  // Articles
  useArticles,
  useArticle,
  useHomeArticles,
  useArticleStatistics,
  useArticleArchives,
  useLikeArticle,
  useRandomArticle,
  // Categories
  useCategories,
  useCategory,
  useCategoryBySlug,
  // Tags
  useTags,
  useTag,
  useTagBySlug,
  // Site
  useSiteConfig,
  useFriendLinks,
  useApplyFriendLink,
  // Comments
  useComments,
  useCommentChildren,
  useRecentComments,
  useCreateComment,
  useLikeComment,
  // Search
  useSearch,
  // Query Keys (for manual cache invalidation)
  queryKeys,
} from "@/lib/queries";

/**
 * API 服务函数
 */
import { apiClient } from "./client";
import type {
  ApiResponse,
  Article,
  ArticleListParams,
  ArticleListResponse,
  ArticleStatistics,
  ArchiveSummaryResponse,
  Category,
  Tag,
  Comment,
  CommentListParams,
  CommentListResponse,
  CreateCommentParams,
  SiteConfig,
  FriendLink,
  SearchResult,
  SearchParams,
} from "./types";

// ========== 文章 API ==========

export const articlesApi = {
  /**
   * 获取文章列表
   */
  getList: (params?: ArticleListParams) =>
    apiClient.get<ApiResponse<ArticleListResponse>>(
      "/public/articles",
      params as unknown as Record<string, string | number | undefined>
    ),

  /**
   * 获取文章详情
   */
  getDetail: (id: string, fullTextToken?: string) =>
    apiClient.get<ApiResponse<Article>>(`/pro/articles/${id}/content`, {
      full_text_token: fullTextToken,
    }),

  /**
   * 获取首页推荐文章
   */
  getHomeArticles: () => apiClient.get<ApiResponse<Article[]>>("/public/articles/home"),

  /**
   * 获取随机文章
   */
  getRandomArticle: () => apiClient.get<ApiResponse<Article>>("/public/articles/random"),

  /**
   * 获取文章归档
   */
  getArchives: () => apiClient.get<ApiResponse<ArchiveSummaryResponse>>("/public/articles/archives"),

  /**
   * 获取文章统计
   */
  getStatistics: () => apiClient.get<ApiResponse<ArticleStatistics>>("/public/articles/statistics"),

  /**
   * 点赞文章
   */
  like: (id: string) => apiClient.post<ApiResponse<{ like_count: number }>>(`/public/articles/${id}/like`),
};

// ========== 分类 API ==========

export const categoriesApi = {
  /**
   * 获取分类列表
   */
  getList: () => apiClient.get<ApiResponse<Category[]>>("/post-categories"),

  /**
   * 获取单个分类
   */
  getById: (id: string) => apiClient.get<ApiResponse<Category>>(`/post-categories/${id}`),

  /**
   * 根据 slug 获取分类
   */
  getBySlug: (slug: string) => apiClient.get<ApiResponse<Category>>(`/post-categories/slug/${slug}`),
};

// ========== 标签 API ==========

export const tagsApi = {
  /**
   * 获取标签列表
   */
  getList: (sort?: "count" | "name") => apiClient.get<ApiResponse<Tag[]>>("/post-tags", { sort: sort || "count" }),

  /**
   * 获取单个标签
   */
  getById: (id: string) => apiClient.get<ApiResponse<Tag>>(`/post-tags/${id}`),

  /**
   * 根据 slug 获取标签
   */
  getBySlug: (slug: string) => apiClient.get<ApiResponse<Tag>>(`/post-tags/slug/${slug}`),
};

// ========== 评论 API ==========

export const commentsApi = {
  /**
   * 获取评论列表
   */
  getList: (params: CommentListParams) =>
    apiClient.get<ApiResponse<CommentListResponse>>(
      "/public/comments",
      params as unknown as Record<string, string | number | undefined>
    ),

  /**
   * 获取评论子评论
   */
  getChildren: (commentId: string, page?: number, pageSize?: number) =>
    apiClient.get<ApiResponse<CommentListResponse>>(`/public/comments/${commentId}/children`, {
      page,
      pageSize,
    }),

  /**
   * 发表评论
   */
  create: (data: CreateCommentParams) => apiClient.post<ApiResponse<Comment>>("/public/comments", data),

  /**
   * 点赞评论
   */
  like: (id: string) => apiClient.post<ApiResponse<{ like_count: number }>>(`/public/comments/${id}/like`),

  /**
   * 获取最新评论
   */
  getRecent: (limit?: number) =>
    apiClient.get<ApiResponse<Comment[]>>("/public/comments/recent", { limit: limit || 10 }),
};

// ========== 搜索 API ==========

export const searchApi = {
  /**
   * 搜索文章
   * @param params 搜索参数
   */
  search: (params: SearchParams) =>
    apiClient.get<ApiResponse<SearchResult>>("/search", {
      q: params.q,
      page: params.page || 1,
      size: params.size || 10,
    }),
};

// ========== 网站配置 API ==========

export const siteApi = {
  /**
   * 获取网站配置
   */
  getConfig: () => apiClient.get<ApiResponse<SiteConfig>>("/public/site-config"),

  /**
   * 获取友情链接
   */
  getFriendLinks: () => apiClient.get<ApiResponse<FriendLink[]>>("/public/friend-links"),

  /**
   * 申请友情链接
   */
  applyFriendLink: (data: Omit<FriendLink, "id" | "status" | "created_at">) =>
    apiClient.post<ApiResponse<FriendLink>>("/public/friend-links/apply", data),
};

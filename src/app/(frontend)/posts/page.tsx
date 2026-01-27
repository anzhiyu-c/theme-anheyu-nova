/*
 * @Description: 文章列表页 - Apple 设计语言风格（优化版）
 * @Author: 安知鱼
 * @Date: 2026-01-23 18:37:09
 * @LastEditTime: 2026-01-24 23:41:07
 * @LastEditors: 安知鱼
 */
"use client";

import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import {
  Search,
  X,
  ArrowRight,
  Clock,
  Eye,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  Calendar,
  Tag,
  Flame,
  MessageCircle,
  Hash,
  FileText,
} from "lucide-react";
import { useArticles, useCategories, useSearch, useSiteConfig } from "@/hooks";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { getArticleCategory, getArticleSummary, getArticleSlug, type Category, type Article } from "@/lib/api/types";
import { FloatingElement, Magnetic } from "@/components/frontend/animations";
import { DynamicSEO } from "@/components/frontend/seo";
import { useHydrated } from "@/hooks";

// 默认封面图片
const DEFAULT_COVER = "/static/img/default_cover.jpg";

/**
 * 判断图片是否需要跳过 Next.js 优化
 * - 相对路径的 API 代理图片需要跳过优化以避免 500 错误
 * - 不在站点域名白名单中的外部图片也需要跳过优化以避免 400 错误
 * @param src 图片 URL
 * @param siteUrl 站点配置中的 SITE_URL（如 https://blog.anheyu.com）
 */
function shouldSkipOptimization(src: string, siteUrl?: string): boolean {
  // 相对路径的 API 代理图片需要跳过优化
  if (src.startsWith("/api/") || src.startsWith("/f/")) {
    return true;
  }

  // 检查外部 URL 是否在允许的域名列表中
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const url = new URL(src);
      const hostname = url.hostname;

      // 构建允许的域名列表：站点配置域名 + localhost
      const allowedHostnames: string[] = ["localhost"];

      // 从站点配置中提取域名
      if (siteUrl) {
        try {
          const siteHostname = new URL(siteUrl).hostname;
          allowedHostnames.push(siteHostname);
          // 也允许子域名（如 blog.anheyu.com 也允许 *.anheyu.com）
          const parts = siteHostname.split(".");
          if (parts.length >= 2) {
            const rootDomain = parts.slice(-2).join(".");
            allowedHostnames.push(rootDomain);
          }
        } catch {
          // 站点 URL 解析失败，忽略
        }
      }

      // 检查是否匹配允许的域名（包括子域名）
      const isAllowed = allowedHostnames.some(allowed => {
        if (hostname === allowed) return true;
        // 检查子域名匹配
        if (hostname.endsWith("." + allowed)) return true;
        return false;
      });

      // 不在白名单中的外部图片需要跳过优化
      return !isAllowed;
    } catch {
      // URL 解析失败，跳过优化
      return true;
    }
  }

  return false;
}

// 视图模式类型
type ViewMode = "grid" | "list";

// 防抖 hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// 热度等级计算
function getHotLevel(viewCount: number): { level: number; label: string; color: string } {
  if (viewCount >= 1000) return { level: 3, label: "热门", color: "text-red-500" };
  if (viewCount >= 500) return { level: 2, label: "推荐", color: "text-orange-500" };
  if (viewCount >= 100) return { level: 1, label: "精选", color: "text-yellow-500" };
  return { level: 0, label: "", color: "" };
}

// 文章卡片组件 - Grid 视图（性能优化版）
const ArticleGridCard = memo(function ArticleGridCard({
  article,
  index,
  siteUrl,
}: {
  article: Article;
  index: number;
  siteUrl?: string;
}) {
  const category = useMemo(() => getArticleCategory(article), [article]);
  const summary = useMemo(() => getArticleSummary(article), [article]);
  const slug = useMemo(() => getArticleSlug(article), [article]);
  const tags = useMemo(() => article.post_tags?.slice(0, 2) || [], [article.post_tags]);
  const hotLevel = useMemo(() => getHotLevel(article.view_count || 0), [article.view_count]);

  return (
    <div className="h-full">
      <Link href={`/posts/${slug}`} className="group block h-full">
        <article className="relative h-full flex flex-col overflow-hidden rounded-xl bg-card border border-transparent transition-all duration-500 ease-out hover:border-border/80 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1">
          {/* 封面图 */}
          <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
            <Image
              src={article.cover_url || DEFAULT_COVER}
              alt={article.title}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={shouldSkipOptimization(article.cover_url || DEFAULT_COVER, siteUrl)}
            />
            {/* 渐变遮罩 - hover 时变亮 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-70" />

            {/* 顶部信息栏 */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              {/* 分类标签 */}
              {category && (
                <span className="rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white/90 transition-all duration-300 group-hover:bg-black/50">
                  {category.name}
                </span>
              )}

              {/* 热度标签 */}
              {hotLevel.level > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-1 text-[11px] font-medium text-white/90">
                  <Flame size={11} className="text-orange-400" />
                  {hotLevel.label}
                </span>
              )}
            </div>

            {/* 底部信息栏 - 在封面图上 */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/80">
              {/* 标签 */}
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {tags.map(tag => (
                    <span key={tag.id} className="flex items-center gap-0.5">
                      <Hash size={10} className="opacity-60" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 阅读时间 */}
              <span className="flex items-center gap-1">
                <Clock size={11} className="opacity-60" />
                {article.reading_time || 1} min
              </span>
            </div>
          </div>

          {/* 内容区 */}
          <div className="flex-1 flex flex-col p-4">
            {/* 标题 - hover 时颜色加深 */}
            <h3 className="text-[15px] font-medium text-foreground line-clamp-2 min-h-[2.75rem] leading-snug transition-colors duration-300 group-hover:text-primary">
              {article.title}
            </h3>

            {/* 描述 */}
            <p className="text-sm text-muted-foreground/80 line-clamp-2 min-h-[2.5rem] mt-2 leading-relaxed">
              {summary || "暂无描述"}
            </p>

            {/* 底部元信息 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground/60 mt-auto pt-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {article.created_at ? format(new Date(article.created_at), "MM/dd", { locale: zhCN }) : "--"}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {article.view_count || 0}
                </span>
                {(article.comment_count || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {article.comment_count}
                  </span>
                )}
              </div>
              {/* 箭头指示 - hover 时出现 */}
              <span className="flex items-center gap-1 transition-all duration-300 group-hover:text-primary">
                <ArrowRight
                  size={14}
                  className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
});

// 文章卡片组件 - List 视图（性能优化版）
const ArticleListCard = memo(function ArticleListCard({
  article,
  siteUrl,
}: {
  article: Article;
  index: number;
  siteUrl?: string;
}) {
  const category = useMemo(() => getArticleCategory(article), [article]);
  const summary = useMemo(() => getArticleSummary(article), [article]);
  const slug = useMemo(() => getArticleSlug(article), [article]);

  return (
    <div className="relative">
      <Link href={`/posts/${slug}`} className="group block">
        {/* 左侧指示条 - hover 时出现 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-primary rounded-full transition-all duration-300 ease-out group-hover:h-12" />

        <article className="relative flex gap-4 sm:gap-5 py-4 sm:py-5 pl-0 transition-all duration-300 ease-out group-hover:pl-4 group-hover:bg-secondary/30 rounded-lg -mx-2 px-2">
          {/* 封面图 */}
          <div className="relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-border/50 transition-all duration-300 group-hover:ring-primary/30 group-hover:shadow-md">
            <Image
              src={article.cover_url || DEFAULT_COVER}
              alt={article.title}
              fill
              className="object-cover transition-all duration-500 ease-out group-hover:scale-105"
              sizes="144px"
              unoptimized={shouldSkipOptimization(article.cover_url || DEFAULT_COVER, siteUrl)}
            />
          </div>

          {/* 内容区 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* 顶部信息：分类 + 日期 */}
            <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-foreground/60 transition-colors duration-300 group-hover:text-muted-foreground/80">
              {category && (
                <span className="transition-colors duration-300 group-hover:text-primary/80">{category.name}</span>
              )}
              {category && <span>·</span>}
              <span>{article.created_at ? format(new Date(article.created_at), "MM/dd", { locale: zhCN }) : "--"}</span>
              <span>·</span>
              <span>{article.reading_time || 1} min</span>
            </div>

            {/* 标题 - 带颜色变化和下划线效果 */}
            <h3 className="text-sm sm:text-[15px] font-medium text-foreground line-clamp-1 sm:line-clamp-2 leading-snug inline-block transition-colors duration-300 group-hover:text-primary">
              <span className="bg-gradient-to-r from-primary to-primary bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-400 group-hover:bg-[length:100%_1px]">
                {article.title}
              </span>
            </h3>

            {/* 描述 - 仅大屏显示 */}
            {summary && (
              <p className="hidden sm:block text-xs text-muted-foreground/50 line-clamp-1 mt-1 transition-colors duration-300 group-hover:text-muted-foreground/70">
                {summary}
              </p>
            )}
          </div>

          {/* 右侧箭头指示 - hover 时出现 */}
          <div className="hidden sm:flex items-center pr-2">
            <ArrowRight
              size={16}
              className="text-muted-foreground/30 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary"
            />
          </div>
        </article>
      </Link>
    </div>
  );
});

// 骨架屏组件 - Grid
function SkeletonGridCard() {
  return (
    <div className="h-full rounded-xl bg-card overflow-hidden animate-pulse">
      <div className="relative aspect-[16/10] bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-secondary rounded-lg w-full" />
        <div className="h-4 bg-secondary rounded-lg w-4/5" />
        <div className="space-y-2">
          <div className="h-4 bg-secondary rounded-lg w-full" />
          <div className="h-4 bg-secondary rounded-lg w-2/3" />
        </div>
        <div className="flex justify-between pt-3 border-t border-border/30">
          <div className="flex gap-3">
            <div className="h-3 bg-secondary rounded w-12" />
            <div className="h-3 bg-secondary rounded w-10" />
          </div>
          <div className="h-3 bg-secondary rounded w-8" />
        </div>
      </div>
    </div>
  );
}

// 骨架屏组件 - List
function SkeletonListCard() {
  return (
    <div className="flex gap-4 sm:gap-6 py-5 sm:py-6 border-b border-border/50 animate-pulse">
      <div className="hidden lg:flex items-center justify-center w-12">
        <div className="h-8 w-8 bg-secondary rounded" />
      </div>
      <div className="w-28 h-20 sm:w-36 sm:h-24 bg-secondary rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-5 bg-secondary rounded-full w-14" />
          <div className="h-5 bg-secondary rounded w-24" />
        </div>
        <div className="h-5 bg-secondary rounded w-3/4" />
        <div className="h-4 bg-secondary rounded w-full hidden sm:block" />
        <div className="gap-1.5 hidden sm:flex">
          <div className="h-4 bg-secondary rounded w-12" />
          <div className="h-4 bg-secondary rounded w-10" />
        </div>
        <div className="flex gap-4 pt-1">
          <div className="h-3 bg-secondary rounded w-10" />
          <div className="h-3 bg-secondary rounded w-12" />
          <div className="h-3 bg-secondary rounded w-10 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pageSize = viewMode === "grid" ? 12 : 10;
  const heroRef = useRef<HTMLDivElement>(null);
  const isHydrated = useHydrated();

  // 滚动视差效果
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // 防抖搜索关键词
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300);
  const isSearchMode = debouncedSearchQuery.length >= 2;

  // API 调用
  const { data: siteConfig } = useSiteConfig();
  const { data, isLoading, error } = useArticles({ page, pageSize });
  const { data: categoriesData } = useCategories();
  const {
    data: searchData,
    isLoading: isSearching,
    isFetching: isSearchFetching,
  } = useSearch(debouncedSearchQuery, searchPage, pageSize);

  const articles = data?.list || [];
  const total = data?.total || 0;
  const categories: Category[] = categoriesData || [];

  // 搜索结果转换
  const searchResults = useMemo((): Article[] => {
    if (!searchData?.hits) return [];
    return searchData.hits.map(hit => ({
      id: hit.id,
      title: hit.title,
      abbrlink: hit.abbrlink,
      cover_url: hit.cover_url || DEFAULT_COVER,
      status: "PUBLISHED" as const,
      view_count: hit.view_count || 0,
      word_count: hit.word_count || 0,
      reading_time: hit.reading_time || 0,
      comment_count: 0,
      summaries: [hit.snippet],
      post_tags: hit.tags?.map((tag, idx) => ({ id: `tag-${idx}`, name: tag, slug: tag })) || [],
      post_categories: hit.category ? [{ id: "cat-1", name: hit.category, slug: hit.category }] : [],
      show_on_home: true,
      home_sort: 0,
      pin_sort: 0,
      is_primary_color_manual: false,
      created_at: hit.publish_date,
      updated_at: hit.publish_date,
      is_doc: hit.is_doc,
      doc_series_id: hit.doc_series_id,
    }));
  }, [searchData]);

  // 显示的文章列表
  const displayArticles = useMemo(() => {
    if (isSearchMode) return searchResults;
    let result = articles;
    if (selectedCategory) {
      result = result.filter(article => {
        const category = getArticleCategory(article);
        return category?.id?.toString() === selectedCategory;
      });
    }
    return result;
  }, [isSearchMode, searchResults, articles, selectedCategory]);

  // 分页信息
  const displayTotal = isSearchMode ? searchData?.pagination?.total || 0 : total;
  const displayTotalPages = isSearchMode ? searchData?.pagination?.totalPages || 0 : Math.ceil(total / pageSize);
  const currentPage = isSearchMode ? searchPage : page;
  const currentLoading = isSearchMode ? isSearching || isSearchFetching : isLoading;

  // 重置搜索页码
  useEffect(() => {
    setSearchPage(1);
  }, [debouncedSearchQuery]);

  // 分页处理
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (isSearchMode) {
        setSearchPage(newPage);
      } else {
        setPage(newPage);
      }
      window.scrollTo({ top: 400, behavior: "smooth" });
    },
    [isSearchMode]
  );

  // 分页范围
  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);

    let startPage = Math.max(1, currentPage - halfShow);
    let endPage = Math.min(displayTotalPages, currentPage + halfShow);

    if (currentPage <= halfShow) {
      endPage = Math.min(displayTotalPages, showPages);
    }
    if (currentPage > displayTotalPages - halfShow) {
      startPage = Math.max(1, displayTotalPages - showPages + 1);
    }

    if (startPage > 1) {
      range.push(1);
      if (startPage > 2) range.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    if (endPage < displayTotalPages) {
      if (endPage < displayTotalPages - 1) range.push("...");
      range.push(displayTotalPages);
    }

    return range;
  }, [currentPage, displayTotalPages]);

  return (
    <div className="relative min-h-screen">
      {/* 动态 SEO */}
      <DynamicSEO title="文章" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-24 pb-8 md:pt-28 md:pb-12">
        {/* 背景动画装饰 - 轻量化处理 */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: heroY, opacity: heroOpacity }}>
          {/* 柔和的光晕效果 */}
          <FloatingElement duration={20} distance={40} className="absolute -right-60 -top-40">
            <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[100px]" />
          </FloatingElement>
          <FloatingElement duration={25} distance={30} className="absolute -left-40 top-10">
            <div className="h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-[80px]" />
          </FloatingElement>
        </motion.div>

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            {/* 装饰图标 */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
              initial={isHydrated ? { opacity: 0, scale: 0.5, rotate: -10 } : false}
              animate={isHydrated ? { opacity: 1, scale: 1, rotate: 0 } : false}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <BookOpen className="w-8 h-8 text-primary" />
            </motion.div>

            {/* 标题 */}
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={isHydrated ? { opacity: 0, y: 40 } : false}
              animate={isHydrated ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                文章
              </span>
            </motion.h1>

            {/* 副标题 */}
            <motion.p
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto"
              initial={isHydrated ? { opacity: 0, y: 30 } : false}
              animate={isHydrated ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              技术探索与思考的记录，每一篇都是一次成长的足迹
            </motion.p>

            {/* 统计卡片 */}
            <motion.div
              className="mt-10 flex items-center justify-center gap-6 sm:gap-10"
              initial={isHydrated ? { opacity: 0, y: 30 } : false}
              animate={isHydrated ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-card/50 backdrop-blur border border-border/50"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  {isSearchMode ? displayTotal : total}
                </span>
                <span className="text-xs text-muted-foreground">{isSearchMode ? "搜索结果" : "篇文章"}</span>
              </motion.div>

              {!isSearchMode && (
                <motion.div
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-card/50 backdrop-blur border border-border/50"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                    {categories.length}
                  </span>
                  <span className="text-xs text-muted-foreground">个分类</span>
                </motion.div>
              )}

              <motion.div
                className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-card/50 backdrop-blur border border-border/50"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  {displayTotalPages || 1}
                </span>
                <span className="text-xs text-muted-foreground">页内容</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 筛选栏 */}
      <motion.section
        className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"
        initial={isHydrated ? { opacity: 0, y: -20 } : false}
        animate={isHydrated ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* 分类筛选 */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0 -mx-1 px-1">
              <motion.button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === null
                    ? "bg-foreground text-background shadow-lg"
                    : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} />
                  全部
                </span>
              </motion.button>

              {categories.map((category, idx) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id?.toString() || null)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id?.toString()
                      ? "bg-foreground text-background shadow-lg"
                      : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={isHydrated ? { opacity: 0, x: -10 } : false}
                  animate={isHydrated ? { opacity: 1, x: 0 } : false}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>

            {/* 搜索和视图切换 */}
            <div className="flex items-center gap-3">
              {/* 搜索框 */}
              <motion.div
                className="relative flex items-center"
                animate={{ width: isSearchFocused ? 280 : 200 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute left-3 pointer-events-none"
                  animate={{ color: isSearchFocused ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  <Search size={16} />
                </motion.div>
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full rounded-full bg-secondary/80 py-2.5 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:bg-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={isHydrated ? { opacity: 0, scale: 0.5, rotate: -90 } : false}
                      animate={isHydrated ? { opacity: 1, scale: 1, rotate: 0 } : false}
                      exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 视图切换 */}
              <div className="hidden md:flex items-center gap-1 rounded-full bg-secondary/80 p-1 border border-border/50">
                {[
                  { mode: "grid" as const, icon: Grid3X3 },
                  { mode: "list" as const, icon: List },
                ].map(({ mode, icon: Icon }) => (
                  <motion.button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`rounded-full p-2.5 transition-all ${
                      viewMode === mode
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={16} />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 文章列表 */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          {/* 搜索提示 */}
          <AnimatePresence>
            {isSearchMode && (
              <motion.div
                initial={isHydrated ? { opacity: 0, height: 0, marginBottom: 0 } : false}
                animate={isHydrated ? { opacity: 1, height: "auto", marginBottom: 24 } : false}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">搜索 &quot;{debouncedSearchQuery}&quot;</p>
                      <p className="text-xs text-muted-foreground">找到 {displayTotal} 条相关结果</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    whileHover={{ x: 2 }}
                  >
                    清除搜索
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 文章列表 */}
          <AnimatePresence mode="wait">
            {currentLoading ? (
              <motion.div
                key="loading"
                initial={isHydrated ? { opacity: 0 } : false}
                animate={isHydrated ? { opacity: 1 } : false}
                exit={{ opacity: 0 }}
                className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-0"}
              >
                {[...Array(viewMode === "grid" ? 6 : 5)].map((_, i) =>
                  viewMode === "grid" ? <SkeletonGridCard key={i} /> : <SkeletonListCard key={i} />
                )}
              </motion.div>
            ) : displayArticles.length === 0 ? (
              <motion.div
                key="empty"
                initial={isHydrated ? { opacity: 0, y: 30 } : false}
                animate={isHydrated ? { opacity: 1, y: 0 } : false}
                exit={{ opacity: 0, y: -30 }}
                className="py-20 md:py-32 text-center"
              >
                <motion.div
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary/50"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Search size={40} className="text-muted-foreground/50" />
                </motion.div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">未找到相关文章</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isSearchMode
                    ? `没有找到与 "${debouncedSearchQuery}" 相关的文章，试试其他关键词？`
                    : "该分类下暂无文章，换个分类看看吧"}
                </p>
                <motion.button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  查看全部文章
                  <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={`content-${viewMode}-${selectedCategory}-${debouncedSearchQuery}-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-0"}
              >
                {displayArticles.map((article, index) =>
                  viewMode === "grid" ? (
                    <ArticleGridCard key={article.id} article={article} index={index} siteUrl={siteConfig?.SITE_URL} />
                  ) : (
                    <ArticleListCard key={article.id} article={article} index={index} siteUrl={siteConfig?.SITE_URL} />
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 分页 */}
          {displayTotalPages > 1 && !currentLoading && displayArticles.length > 0 && (
            <motion.div
              className="mt-16 flex items-center justify-center gap-2"
              initial={isHydrated ? { opacity: 0, y: 20 } : false}
              animate={isHydrated ? { opacity: 1, y: 0 } : false}
              transition={{ delay: 0.5 }}
            >
              <Magnetic strength={0.1}>
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all border border-border/50"
                  whileHover={{ scale: currentPage > 1 ? 1.08 : 1 }}
                  whileTap={{ scale: currentPage > 1 ? 0.92 : 1 }}
                >
                  <ChevronLeft size={18} />
                </motion.button>
              </Magnetic>

              <div className="flex items-center gap-1.5 mx-2">
                {paginationRange.map((pageNum, index) =>
                  pageNum === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground text-sm">
                      ···
                    </span>
                  ) : (
                    <motion.button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum as number)}
                      className={`flex h-11 min-w-[44px] items-center justify-center rounded-full text-sm font-medium transition-all border ${
                        currentPage === pageNum
                          ? "bg-foreground text-background border-foreground shadow-lg"
                          : "bg-secondary/60 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
                      }`}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      {pageNum}
                    </motion.button>
                  )
                )}
              </div>

              <Magnetic strength={0.1}>
                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === displayTotalPages}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all border border-border/50"
                  whileHover={{ scale: currentPage < displayTotalPages ? 1.08 : 1 }}
                  whileTap={{ scale: currentPage < displayTotalPages ? 0.92 : 1 }}
                >
                  <ChevronRight size={18} />
                </motion.button>
              </Magnetic>
            </motion.div>
          )}
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-background to-background pointer-events-none" />

        {/* 装饰背景 */}
        <FloatingElement duration={30} distance={20} className="absolute right-0 bottom-0">
          <div className="h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[80px]" />
        </FloatingElement>

        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial={isHydrated ? { opacity: 0, y: 30 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">探索更多内容</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              除了文章，还可以浏览分类和标签，发现更多有趣的内容
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic strength={0.12}>
                <Link
                  href="/categories"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:bg-foreground/90 shadow-lg hover:shadow-xl"
                >
                  <Tag size={16} />
                  浏览分类
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.12}>
                <Link
                  href="/tags"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                >
                  浏览标签
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

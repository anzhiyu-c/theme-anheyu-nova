"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Calendar, ArrowUpRight, Eye, Heart, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Article } from "@/lib/api/types";
import { getArticleCategory, getArticleSummary, getArticleSlug } from "@/lib/api/types";
import { useHydrated } from "@/hooks";

// 默认封面图片
const DEFAULT_COVER = "/static/img/default_cover.jpg";

/**
 * 获取文章封面URL，如果没有则返回默认封面
 */
function getArticleCover(article: Article): string {
  return article.cover_url || article.top_img_url || DEFAULT_COVER;
}

interface ArticleCardProps {
  article: Article;
  index: number;
  variant?: "featured" | "normal" | "minimal";
}

/**
 * Apple 风格文章卡片
 * 带有高级动画和微交互
 */
export function ArticleCard({ article, index, variant = "normal" }: ArticleCardProps) {
  if (variant === "featured") {
    return <FeaturedCard article={article} index={index} />;
  }

  if (variant === "minimal") {
    return <MinimalCard article={article} index={index} />;
  }

  return <NormalCard article={article} index={index} />;
}

function FeaturedCard({ article, index }: { article: Article; index: number }) {
  const isHydrated = useHydrated();

  // 3D 倾斜效果
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const category = getArticleCategory(article);
  const summary = getArticleSummary(article);
  const slug = getArticleSlug(article);
  const coverUrl = getArticleCover(article);

  return (
    <motion.div
      initial={isHydrated ? { opacity: 0, y: 60 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ perspective: 1000 }}
    >
      <Link href={`/posts/${slug}`} className="group block">
        <motion.article
          className="relative overflow-hidden rounded-3xl bg-secondary"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.4 }}
        >
          {/* 封面图 */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <motion.img
              src={coverUrl}
              alt={article.title}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              onError={e => {
                // 图片加载失败时使用默认封面
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_COVER) {
                  target.src = DEFAULT_COVER;
                }
              }}
            />

            {/* 多层渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* 光泽效果 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ transform: "translateZ(20px)" }}
            />

            {/* 内容 */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12" style={{ transform: "translateZ(30px)" }}>
              {category && (
                <motion.span
                  className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md border border-white/10"
                  initial={isHydrated ? { opacity: 0, y: 20 } : false}
                  animate={isHydrated ? { opacity: 1, y: 0 } : false}
                  transition={{ delay: 0.2 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {category.name}
                </motion.span>
              )}

              <motion.h2
                className="mb-4 text-2xl font-bold text-white md:text-4xl lg:text-5xl leading-tight"
                initial={isHydrated ? { opacity: 0, y: 20 } : false}
                animate={isHydrated ? { opacity: 1, y: 0 } : false}
                transition={{ delay: 0.3 }}
              >
                {article.title}
              </motion.h2>

              {summary && (
                <motion.p
                  className="mb-6 line-clamp-2 max-w-2xl text-base text-white/75 md:text-lg leading-relaxed"
                  initial={isHydrated ? { opacity: 0, y: 20 } : false}
                  animate={isHydrated ? { opacity: 1, y: 0 } : false}
                  transition={{ delay: 0.4 }}
                >
                  {summary}
                </motion.p>
              )}

              <motion.div
                className="flex flex-wrap items-center gap-6 text-sm text-white/50"
                initial={isHydrated ? { opacity: 0, y: 20 } : false}
                animate={isHydrated ? { opacity: 1, y: 0 } : false}
                transition={{ delay: 0.5 }}
              >
                <span className="flex items-center gap-2">
                  <Calendar size={14} />
                  {format(new Date(article.created_at), "yyyy年MM月dd日")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} />
                  {article.reading_time} 分钟阅读
                </span>
                {article.view_count > 0 && (
                  <span className="flex items-center gap-2">
                    <Eye size={14} />
                    {article.view_count.toLocaleString()} 阅读
                  </span>
                )}
              </motion.div>
            </div>

            {/* 悬停箭头 */}
            <motion.div
              className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20"
              initial={isHydrated ? { opacity: 0, scale: 0.8, rotate: -45 } : false}
              animate={isHydrated ? { opacity: 1, scale: 1, rotate: 0 } : false}
              whileHover={{ scale: 1.15, backgroundColor: "rgba(255,255,255,0.2)" }}
              transition={{ duration: 0.4 }}
              style={{ transform: "translateZ(40px)" }}
            >
              <ArrowUpRight
                size={22}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </motion.div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

function NormalCard({ article, index }: { article: Article; index: number }) {
  const isHydrated = useHydrated();
  const category = getArticleCategory(article);
  const summary = getArticleSummary(article);
  const slug = getArticleSlug(article);
  const coverUrl = getArticleCover(article);

  return (
    <motion.div
      initial={isHydrated ? { opacity: 0, y: 40 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/posts/${slug}`} className="group block">
        <motion.article
          className="relative overflow-hidden rounded-2xl bg-card/50 border border-border transition-colors duration-500 hover:bg-card hover:border-primary/50"
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* 封面图 */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.img
              src={coverUrl}
              alt={article.title}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              onError={e => {
                // 图片加载失败时使用默认封面
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_COVER) {
                  target.src = DEFAULT_COVER;
                }
              }}
            />

            {/* 悬停遮罩 */}
            <motion.div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 悬停显示的统计 */}
            <motion.div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {article.reading_time} min
              </span>
              {article.view_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye size={12} />
                  {article.view_count.toLocaleString()}
                </span>
              )}
            </motion.div>
          </div>

          {/* 内容 */}
          <div className="p-6 flex flex-col">
            <div className="mb-3 flex items-center gap-3">
              {category && (
                <motion.span
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"
                  whileHover={{ x: 2 }}
                >
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {category.name}
                </motion.span>
              )}
              <span className="text-xs text-muted-foreground">{format(new Date(article.created_at), "MM/dd")}</span>
            </div>

            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
              {article.title}
            </h3>

            {/* 简介区域 - 固定高度确保卡片对齐 */}
            <div className="h-10 mb-2">
              {summary && <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">{summary}</p>}
            </div>

            {/* 阅读更多 */}
            <motion.div
              className="mt-auto flex items-center gap-2 text-sm font-medium text-foreground"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <span className="transition-colors group-hover:text-primary">阅读文章</span>
              <ArrowUpRight
                size={14}
                className="transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary"
              />
            </motion.div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

function MinimalCard({ article, index }: { article: Article; index: number }) {
  const isHydrated = useHydrated();
  const category = getArticleCategory(article);
  const summary = getArticleSummary(article);
  const slug = getArticleSlug(article);

  return (
    <motion.div
      initial={isHydrated ? { opacity: 0, x: -30 } : false}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/posts/${slug}`} className="group block">
        <motion.article
          className="relative flex items-start gap-6 border-b border-border py-8 transition-colors"
          whileHover={{ x: 8 }}
          transition={{ duration: 0.3 }}
        >
          {/* 左侧装饰线 */}
          <motion.div
            className="absolute left-0 top-8 bottom-8 w-0.5 bg-primary origin-top"
            initial={{ scaleY: 0 }}
            whileHover={{ scaleY: 1 }}
            transition={{ duration: 0.3 }}
          />

          <div className="flex-1 pl-4">
            <div className="mb-3 flex items-center gap-4">
              {category && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  {category.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {format(new Date(article.created_at), "yyyy年MM月dd日")}
              </span>
            </div>

            <h3 className="mb-3 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary leading-snug">
              {article.title}
            </h3>

            {summary && <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">{summary}</p>}

            {/* 底部统计 */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {article.reading_time} 分钟
              </span>
              {article.view_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye size={12} />
                  {article.view_count.toLocaleString()}
                </span>
              )}
              {article.comment_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Heart size={12} />
                  {article.comment_count}
                </span>
              )}
            </div>
          </div>

          <motion.div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpRight
              size={18}
              className="text-muted-foreground transition-all duration-300 group-hover:text-primary-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </motion.div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

/**
 * 文章卡片骨架屏
 */
export function ArticleCardSkeleton({ variant = "normal" }: { variant?: "featured" | "normal" | "minimal" }) {
  if (variant === "featured") {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="flex items-start gap-6 border-b border-border py-8">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card/50 border border-border">
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="space-y-3 p-6">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

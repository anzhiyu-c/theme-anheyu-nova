"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Calendar, Clock, Hash, ArrowLeft, Flame, FileText } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { Article } from "@/lib/api/types";
import { getArticleCategory, getArticleSlug } from "@/lib/api/types";
import { PostContent, PostPagination, ArticleLink, RelatedPosts, RelatedArticle } from "@/components/frontend/post";
import "@/styles/post-detail.css";

// 动画配置
const heroAnimations = {
  // 背景图片动画
  cover: {
    initial: { scale: 1.1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  // 容器动画
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 },
  },
  // 信息区域动画
  infoWrapper: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// 交错动画变体
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.4,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// 标题字符动画
const titleContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.5,
    },
  },
};

const titleChar = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// 元信息项动画
const metaItemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const metaContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.7,
    },
  },
};

// 默认封面图片
const DEFAULT_COVER = "/static/img/default_cover.jpg";
// 默认主色
const DEFAULT_PRIMARY_COLOR = "#3b82f6";

// 统一的文章数据接口
interface UnifiedArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover: string;
  viewCount: number;
  readingTime: number;
  wordCount: number;
  createdAt: string;
  primaryColor?: string;
  category?: { id: string; name: string };
  tags?: Array<{ id: string; name: string }>;
  prevArticle?: ArticleLink | null;
  nextArticle?: ArticleLink | null;
  relatedArticles?: RelatedArticle[];
}

// 转换 API 数据格式
function normalizeArticle(article: Article): UnifiedArticle {
  const category = getArticleCategory(article);
  // 处理空字符串情况，确保使用默认封面
  const coverUrl =
    article.cover_url && article.cover_url.trim()
      ? article.cover_url
      : article.top_img_url && article.top_img_url.trim()
      ? article.top_img_url
      : DEFAULT_COVER;
  return {
    id: article.id,
    title: article.title,
    slug: getArticleSlug(article),
    content: article.content_html || article.content_md || "",
    cover: coverUrl,
    viewCount: article.view_count,
    readingTime: article.reading_time,
    wordCount: article.word_count || 0,
    createdAt: article.created_at,
    primaryColor: article.primary_color || DEFAULT_PRIMARY_COLOR,
    category: category ? { id: category.id, name: category.name } : undefined,
    tags: article.post_tags?.map(t => ({ id: t.id, name: t.name })),
    prevArticle: article.prev_article
      ? {
          id: article.prev_article.id,
          title: article.prev_article.title,
          abbrlink: article.prev_article.abbrlink,
          isDoc: article.prev_article.is_doc,
          docSeriesId: article.prev_article.doc_series_id,
        }
      : null,
    nextArticle: article.next_article
      ? {
          id: article.next_article.id,
          title: article.next_article.title,
          abbrlink: article.next_article.abbrlink,
          isDoc: article.next_article.is_doc,
          docSeriesId: article.next_article.doc_series_id,
        }
      : null,
    relatedArticles: article.related_articles?.map(r => ({
      id: r.id,
      title: r.title,
      abbrlink: r.abbrlink,
      coverUrl: r.cover_url,
      isDoc: r.is_doc,
      docSeriesId: r.doc_series_id,
    })),
  };
}

interface PostDetailClientProps {
  article: Article;
}

export default function PostDetailClient({ article: rawArticle }: PostDetailClientProps) {
  // 用于检测客户端 hydration 是否完成
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 转换文章数据
  const article = normalizeArticle(rawArticle);

  // 阅读进度追踪
  const updateScrollProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, [updateScrollProgress]);

  // 动态样式（使用文章主色）
  const dynamicStyles = {
    "--article-primary": article.primaryColor,
    "--article-primary-light": `${article.primaryColor}20`,
    "--article-primary-medium": `${article.primaryColor}40`,
  } as React.CSSProperties;

  return (
    <article className="post-detail-page" style={dynamicStyles}>
      {/* Hero Section - 参考 anheyu-pro 设计 */}
      <motion.section
        className="post-hero"
        initial={isHydrated ? heroAnimations.container.initial : false}
        animate={isHydrated ? heroAnimations.container.animate : false}
        transition={heroAnimations.container.transition}
      >
        {/* 背景装饰图片（模糊处理）- 带缩放动画 */}
        <motion.div
          className="post-hero-cover"
          initial={isHydrated ? heroAnimations.cover.initial : false}
          animate={isHydrated ? heroAnimations.cover.animate : false}
          transition={heroAnimations.cover.transition}
        >
          <img src={article.cover} alt="" className="post-hero-cover-img" />
        </motion.div>

        {/* 文章信息区域 */}
        <div className="post-hero-info">
          <motion.div
            className="post-hero-info-inner"
            initial={isHydrated ? heroAnimations.infoWrapper.initial : false}
            animate={isHydrated ? heroAnimations.infoWrapper.animate : false}
            transition={heroAnimations.infoWrapper.transition}
          >
            {/* 第一行：原创标签 + 分类 + 标签 - 交错动画 */}
            <motion.div
              className="post-meta-firstline"
              variants={staggerContainer}
              initial={isHydrated ? "initial" : false}
              animate={isHydrated ? "animate" : false}
            >
              {/* 原创标签 */}
              <motion.span className="post-meta-original" variants={fadeInScale}>
                原创
              </motion.span>

              {/* 分类 */}
              {article.category && (
                <motion.div variants={fadeInScale}>
                  <Link href={`/categories?id=${article.category.id}`} className="post-meta-category">
                    {article.category.name}
                  </Link>
                </motion.div>
              )}

              {/* 标签列表 */}
              {article.tags && article.tags.length > 0 && (
                <div className="post-meta-tags">
                  {article.tags.map((tag, index) => (
                    <motion.div key={tag.id} variants={slideInFromLeft} custom={index}>
                      <Link href={`/tags?id=${tag.id}`} className="post-meta-tag">
                        <Hash size={14} className="opacity-60" />
                        <span>{tag.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* 标题 - 字符逐个动画 */}
            <motion.h1
              className="post-hero-title"
              variants={titleContainer}
              initial={isHydrated ? "initial" : false}
              animate={isHydrated ? "animate" : false}
            >
              {article.title.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={titleChar}
                  style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            {/* 元信息行 - 交错动画 */}
            <motion.div
              className="post-meta-secondline"
              variants={metaContainer}
              initial={isHydrated ? "initial" : false}
              animate={isHydrated ? "animate" : false}
            >
              <motion.div className="post-meta-item" title="字数总计" variants={metaItemVariants}>
                <FileText size={15} />
                <span>{article.wordCount.toLocaleString()}</span>
              </motion.div>

              <motion.span className="post-meta-sep" variants={metaItemVariants}>
                ·
              </motion.span>

              <motion.div
                className="post-meta-item"
                title={`预计阅读时长${article.readingTime}分钟`}
                variants={metaItemVariants}
              >
                <Clock size={15} />
                <span>{article.readingTime}分钟</span>
              </motion.div>

              <motion.span className="post-meta-sep" variants={metaItemVariants}>
                ·
              </motion.span>

              <motion.div className="post-meta-item" title="发布日期" variants={metaItemVariants}>
                <Calendar size={15} />
                <span>{format(new Date(article.createdAt), "yyyy-MM-dd")}</span>
              </motion.div>

              <motion.span className="post-meta-sep" variants={metaItemVariants}>
                ·
              </motion.span>

              <motion.div className="post-meta-item" title="热度" variants={metaItemVariants}>
                <Flame size={15} />
                <span>{article.viewCount}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Section - 内容区域从底部滑入 */}
      <motion.section
        className="post-content-section"
        initial={isHydrated ? { opacity: 0, y: 40 } : false}
        animate={isHydrated ? { opacity: 1, y: 0 } : false}
        transition={{ delay: 0.8, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          className="post-content-wrapper"
          initial={isHydrated ? { opacity: 0 } : false}
          animate={isHydrated ? { opacity: 1 } : false}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {/* 文章内容 */}
          <PostContent content={article.content} />

          {/* 上一篇/下一篇 */}
          <PostPagination prevArticle={article.prevArticle} nextArticle={article.nextArticle} />

          {/* 猜你喜欢 */}
          <RelatedPosts posts={article.relatedArticles} />

          {/* 底部操作 */}
          <motion.div
            className="post-footer"
            initial={isHydrated ? { opacity: 0, y: 20 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button as={Link} href="/posts" variant="bordered" radius="full">
              <ArrowLeft size={16} />
              返回文章列表
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>
    </article>
  );
}

"use client";

/**
 * 动态 SEO 组件
 * 在客户端动态更新页面标题和 meta 标签
 * 与 anheyu-pro 保持一致的做法
 */

import { useEffect } from "react";
import { useSiteConfig } from "@/lib/queries/site";

interface DynamicSEOProps {
  /** 页面标题（不包含站点名称） */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 页面关键词 */
  keywords?: string;
  /** OG 图片 */
  image?: string;
  /** 页面类型 */
  type?: "website" | "article";
}

/**
 * 动态更新 meta 标签
 */
function updateMetaTag(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    if (isProperty) {
      meta.setAttribute("property", name);
    } else {
      meta.setAttribute("name", name);
    }
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

/**
 * 动态 SEO 组件
 * 在 React 挂载后，从 API 获取站点配置并更新 SEO 元数据
 */
export function DynamicSEO({ title, description, keywords, image, type = "website" }: DynamicSEOProps) {
  const { data: siteConfig } = useSiteConfig();

  useEffect(() => {
    if (!siteConfig) return;

    const siteName = siteConfig.APP_NAME || "安和鱼";
    const siteDescription = description || siteConfig.SITE_DESCRIPTION || "探索思想的边界，记录每一个灵感";
    const siteKeywords = keywords || siteConfig.SITE_KEYWORDS || "博客,技术,生活,思考";
    const siteUrl = siteConfig.SITE_URL || window.location.origin;
    const siteLogo = image || siteConfig.LOGO_URL_192x192 || `${siteUrl}/static/img/logo-192x192.png`;

    // 更新页面标题
    if (title) {
      document.title = `${title} | ${siteName}`;
    } else {
      document.title = siteName;
    }

    // 更新基本 meta 标签
    updateMetaTag("description", siteDescription);
    updateMetaTag("keywords", siteKeywords);

    // 更新 Open Graph 标签
    updateMetaTag("og:title", title ? `${title} | ${siteName}` : siteName, true);
    updateMetaTag("og:description", siteDescription, true);
    updateMetaTag("og:site_name", siteName, true);
    updateMetaTag("og:url", window.location.href, true);
    updateMetaTag("og:image", siteLogo, true);
    updateMetaTag("og:type", type, true);

    // 更新 Twitter 标签
    updateMetaTag("twitter:title", title ? `${title} | ${siteName}` : siteName);
    updateMetaTag("twitter:description", siteDescription);
    updateMetaTag("twitter:image", siteLogo);
    updateMetaTag("twitter:card", "summary_large_image");

    console.log("[DynamicSEO] SEO 元数据已更新:", {
      title: document.title,
      siteName,
      siteDescription,
    });
  }, [siteConfig, title, description, keywords, image, type]);

  // 这个组件不渲染任何可见内容
  return null;
}

/**
 * 文章页面专用 SEO 组件
 */
interface ArticleSEOProps {
  title: string;
  description?: string;
  keywords?: string;
  coverImage?: string;
  author?: string;
  publishedTime?: string;
}

export function ArticleSEO({ title, description, keywords, coverImage, author, publishedTime }: ArticleSEOProps) {
  const { data: siteConfig } = useSiteConfig();

  useEffect(() => {
    if (!siteConfig) return;

    const siteName = siteConfig.APP_NAME || "安和鱼";
    const siteUrl = siteConfig.SITE_URL || window.location.origin;
    const articleDescription = description || siteConfig.SITE_DESCRIPTION || "探索思想的边界，记录每一个灵感";
    const articleImage = coverImage || siteConfig.LOGO_URL_192x192 || `${siteUrl}/static/img/logo-192x192.png`;

    // 更新页面标题
    document.title = `${title} | ${siteName}`;

    // 更新基本 meta 标签
    updateMetaTag("description", articleDescription);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }
    if (author) {
      updateMetaTag("author", author);
    }

    // 更新 Open Graph 标签（文章类型）
    updateMetaTag("og:type", "article", true);
    updateMetaTag("og:title", `${title} | ${siteName}`, true);
    updateMetaTag("og:description", articleDescription, true);
    updateMetaTag("og:site_name", siteName, true);
    updateMetaTag("og:url", window.location.href, true);
    updateMetaTag("og:image", articleImage, true);

    if (publishedTime) {
      updateMetaTag("article:published_time", publishedTime, true);
    }
    if (author) {
      updateMetaTag("article:author", author, true);
    }

    // 更新 Twitter 标签
    updateMetaTag("twitter:title", `${title} | ${siteName}`);
    updateMetaTag("twitter:description", articleDescription);
    updateMetaTag("twitter:image", articleImage);
    updateMetaTag("twitter:card", "summary_large_image");

    console.log("[ArticleSEO] 文章 SEO 元数据已更新:", {
      title: document.title,
      siteName,
      articleDescription,
    });
  }, [siteConfig, title, description, keywords, coverImage, author, publishedTime]);

  return null;
}

export default DynamicSEO;

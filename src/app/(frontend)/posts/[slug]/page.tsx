import { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailClient from "./PostDetailClient";
import { getArticleBySlug, getSiteConfig, defaultSiteConfig } from "@/lib/api/server";

/**
 * 文章详情页 - Server Component
 *
 * SSR 模式：
 * - 在服务端获取文章数据
 * - 传递给客户端组件进行交互渲染
 * - 动态渲染：每次请求时获取最新数据
 */

// 强制动态渲染，避免构建时预渲染导致的 API 连接问题
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 生成动态 metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const siteConfig = await getSiteConfig();
  const config = { ...defaultSiteConfig, ...siteConfig };

  if (!article) {
    return {
      title: "文章不存在",
    };
  }

  // 提取纯文本描述
  const description =
    article.summaries?.[0] ||
    (article.content_html || article.content_md || "").replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${article.title} - ${config.APP_NAME}`,
    description,
    keywords: article.keywords || article.post_tags?.map((t) => t.name).join(","),
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.owner_nickname || config.APP_NAME as string],
      images: article.cover_url ? [article.cover_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 服务端获取文章数据
  const article = await getArticleBySlug(slug);

  // 文章不存在时返回 404
  if (!article) {
    notFound();
  }

  return <PostDetailClient article={article} />;
}

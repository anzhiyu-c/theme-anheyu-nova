import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getArticles, getSiteConfig, defaultSiteConfig } from "@/lib/api/server";

/**
 * 首页 - Server Component
 *
 * SSR 模式：
 * - 在服务端获取文章列表数据
 * - 传递给客户端组件进行交互渲染
 * - 动态渲染：每次请求时获取最新数据
 */

// 强制动态渲染，避免构建时预渲染导致的 API 连接问题
export const dynamic = "force-dynamic";

// 生成动态 metadata
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const config = { ...defaultSiteConfig, ...siteConfig };

  return {
    title: config.APP_NAME,
    description: config.SITE_DESCRIPTION,
    keywords: config.SITE_KEYWORDS,
    openGraph: {
      title: config.APP_NAME,
      description: config.SITE_DESCRIPTION,
      siteName: config.APP_NAME,
      type: "website",
    },
  };
}

export default async function HomePage() {
  // 服务端获取文章列表
  const articlesData = await getArticles({ page: 1, pageSize: 10 });
  const articles = articlesData?.list || [];

  return <HomeClient articles={articles} />;
}

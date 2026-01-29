import type { Metadata } from "next";
import { Providers } from "@/providers";
import { getSiteConfig, defaultSiteConfig } from "@/lib/api/server";
import "./globals.css";

/**
 * 动态生成 SEO Metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const config = { ...defaultSiteConfig, ...siteConfig };

  const siteName = config.APP_NAME || "安和鱼";
  const siteDescription = config.SITE_DESCRIPTION || "探索思想的边界，记录每一个灵感";
  const siteKeywords = config.SITE_KEYWORDS || "博客,技术,生活,思考";
  const siteUrl = config.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";
  // 静态资源使用前端内置的默认文件
  const siteLogo = config.LOGO_URL_192x192 || "/static/img/logo-192x192.png";
  const favicon = config.ICON_URL || "/favicon.ico";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: siteKeywords,
    icons: {
      icon: favicon,
      apple: config.LOGO_URL_192x192 || "/static/img/logo-192x192.png",
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      siteName: siteName,
      title: siteName,
      description: siteDescription,
      url: siteUrl,
      images: siteLogo ? [{ url: siteLogo }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: siteLogo ? [siteLogo] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * 根布局组件
 *
 * 服务端获取站点配置后传递给 Providers，
 * 用于初始化客户端站点信息（API URL 始终使用当前站点地址）。
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 服务端获取站点配置
  const siteConfig = await getSiteConfig();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers initialSiteConfig={siteConfig}>{children}</Providers>
      </body>
    </html>
  );
}

import { Metadata } from "next";
import { getSiteConfig, getArticleStatistics, defaultSiteConfig } from "@/lib/api/server";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "关于",
  description: "了解更多关于我的信息，包括技能、经历和联系方式。",
};

export default async function AboutPage() {
  // 并行获取配置和统计数据
  const [config, statistics] = await Promise.all([
    getSiteConfig(),
    getArticleStatistics(),
  ]);

  // 合并默认配置
  const siteConfig = { ...defaultSiteConfig, ...config };

  // 提取作者信息
  const authorInfo = {
    name: siteConfig.APP_NAME || "Author",
    avatar: siteConfig.USER_AVATAR || "",
    description: siteConfig.sidebar?.author?.description || siteConfig.SITE_DESCRIPTION || "",
    subTitle: siteConfig.SUB_TITLE || "",
    statusImg: siteConfig.sidebar?.author?.statusImg || "",
    skills: siteConfig.sidebar?.author?.skills || [],
    social: siteConfig.sidebar?.author?.social || {},
    siteUrl: siteConfig.SITE_URL || "",
  };

  // 提取统计数据
  const stats = {
    totalArticles: statistics?.total_articles || 0,
    totalWords: statistics?.total_words || 0,
    totalViews: statistics?.total_views || 0,
    totalComments: statistics?.total_comments || 0,
    categoryCount: statistics?.category_count || 0,
    tagCount: statistics?.tag_count || 0,
  };

  return <AboutContent authorInfo={authorInfo} stats={stats} />;
}

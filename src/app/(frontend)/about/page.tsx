import { Metadata } from "next";
import {
  getSiteConfig,
  getArticleStatistics,
  getCommentCount,
  getThemeConfig,
  parseAboutThemeConfig,
  defaultSiteConfig,
} from "@/lib/api/server";
import type { AboutPageConfig, CreativityConfig } from "@/lib/api/types";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "关于",
  description: "了解更多关于我的信息，包括技能、经历和联系方式。",
};

/**
 * 安全解析 JSON 字符串
 */
function safeParseJSON<T>(value: unknown, defaultValue: T): T {
  if (!value) return defaultValue;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

/**
 * 从 SiteConfig 中提取关于页面配置
 * 后端以 about.page.* 的 key 返回配置
 */
function extractAboutConfig(config: Record<string, unknown>): AboutPageConfig {
  return {
    // 基础信息
    name: config["about.page.name"] as string | undefined,
    description: config["about.page.description"] as string | undefined,
    avatarImg: config["about.page.avatar_img"] as string | undefined,
    subtitle: config["about.page.subtitle"] as string | undefined,
    avatarSkillsLeft: safeParseJSON(config["about.page.avatar_skills_left"], []),
    avatarSkillsRight: safeParseJSON(config["about.page.avatar_skills_right"], []),

    // 各模块配置
    aboutSiteTips: safeParseJSON(config["about.page.about_site_tips"], {}),
    statisticsBackground: config["about.page.statistics_background"] as string | undefined,
    map: safeParseJSON(config["about.page.map"], {}),
    selfInfo: safeParseJSON(config["about.page.self_info"], {}),
    personalities: safeParseJSON(config["about.page.personalities"], {}),
    maxim: safeParseJSON(config["about.page.maxim"], {}),
    buff: safeParseJSON(config["about.page.buff"], {}),
    game: safeParseJSON(config["about.page.game"], {}),
    comic: safeParseJSON(config["about.page.comic"], {}),
    like: safeParseJSON(config["about.page.like"], {}),
    music: safeParseJSON(config["about.page.music"], {}),
    careers: safeParseJSON(config["about.page.careers"], {}),
    skillsTips: safeParseJSON(config["about.page.skills_tips"], {}),
    skillGroups: safeParseJSON(config["about.page.skill_groups"], undefined),

    // 自定义内容
    customCode: config["about.page.custom_code"] as string | undefined,
    customCodeHtml: config["about.page.custom_code_html"] as string | undefined,

    // 板块开关
    enable: {
      authorBox: config["about.page.enable.author_box"] !== "false",
      pageContent: config["about.page.enable.page_content"] !== "false",
      skills: config["about.page.enable.skills"] !== "false",
      careers: config["about.page.enable.careers"] !== "false",
      statistic: config["about.page.enable.statistic"] !== "false",
      mapAndInfo: config["about.page.enable.map_and_info"] !== "false",
      personality: config["about.page.enable.personality"] !== "false",
      photo: config["about.page.enable.photo"] !== "false",
      maxim: config["about.page.enable.maxim"] !== "false",
      buff: config["about.page.enable.buff"] !== "false",
      game: config["about.page.enable.game"] !== "false",
      comic: config["about.page.enable.comic"] !== "false",
      likeTech: config["about.page.enable.like_tech"] !== "false",
      music: config["about.page.enable.music"] !== "false",
      customCode: config["about.page.enable.custom_code"] !== "false",
      comment: config["about.page.enable.comment"] !== "false",
    },
  };
}

export default async function AboutPage() {
  // 并行获取配置、统计数据、评论总数和主题配置
  const [config, statistics, commentCount, themeConfig] = await Promise.all([
    getSiteConfig(),
    getArticleStatistics(),
    getCommentCount(),
    getThemeConfig(),
  ]);

  // 合并默认配置
  const siteConfig = { ...defaultSiteConfig, ...config };

  // 提取关于页面专用配置（系统配置）
  const aboutConfig = extractAboutConfig(siteConfig as Record<string, unknown>);

  // 解析关于页面主题配置（主题特有配置）
  const aboutThemeConfig = parseAboutThemeConfig(themeConfig);

  // 提取首页技能配置（可用于技能标签云）
  const creativityConfig = safeParseJSON<CreativityConfig>(siteConfig["CREATIVITY"], {});

  // 提取作者信息（优先使用关于页面配置，fallback 到侧边栏配置）
  const authorInfo = {
    name: aboutConfig.name || siteConfig.APP_NAME || "Author",
    avatar: aboutConfig.avatarImg || siteConfig.USER_AVATAR || "",
    description:
      aboutConfig.description || siteConfig.sidebar?.author?.description || siteConfig.SITE_DESCRIPTION || "",
    subTitle: aboutConfig.subtitle || siteConfig.SUB_TITLE || "",
    statusImg: siteConfig.sidebar?.author?.statusImg || "",
    skills: siteConfig.sidebar?.author?.skills || [],
    social: siteConfig.sidebar?.author?.social || {},
    siteUrl: siteConfig.SITE_URL || "",
    email: siteConfig.comment?.blogger_email || "",
  };

  // 提取统计数据
  // 优先使用站点配置中的数据（由系统自动更新），其次使用 statistics API
  const stats = {
    totalArticles: siteConfig.sidebar?.siteinfo?.totalPostCount || statistics?.total_posts || 0,
    totalWords: siteConfig.sidebar?.siteinfo?.totalWordCount || statistics?.total_words || 0,
    totalViews: statistics?.total_views || 0,
    totalComments: commentCount,
    categoryCount: statistics?.category_stats?.length || 0,
    tagCount: statistics?.tag_stats?.length || 0,
  };

  return (
    <AboutContent
      authorInfo={authorInfo}
      stats={stats}
      aboutConfig={aboutConfig}
      creativityConfig={creativityConfig}
      themeConfig={aboutThemeConfig}
    />
  );
}

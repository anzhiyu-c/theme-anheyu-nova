/*
 * @Description: Zustand Store - 仅用于 Client State
 * @Author: 安知鱼
 * @Date: 2026-01-23 17:04:52
 * @LastEditTime: 2026-01-24 16:04:35
 * @LastEditors: 安知鱼
 */

/**
 * Store 导出
 *
 * 架构说明：
 * - Server State (API 数据): 使用 TanStack Query (@/lib/queries)
 * - Client State (UI 状态): 使用 Zustand (本文件)
 */

// Client State - 主题配置
export { useThemeStore, colorThemes } from "./themeStore";
export type { ColorThemeId } from "./themeStore";

// 导出类型 (从 API types 重导出)
export type { Article, Category, Tag, Comment, SiteConfig, FriendLink } from "@/lib/api/types";

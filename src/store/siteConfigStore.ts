/*
 * @Description: 站点配置存储 - 管理站点配置
 * @Author: 安知鱼
 * @Date: 2026-01-28
 */

import { create } from "zustand";
import type { SiteConfig } from "@/lib/api/types";

interface SiteConfigState {
  /** 站点配置 */
  config: SiteConfig | null;
  /** 是否已初始化 */
  initialized: boolean;
  /** 设置站点配置 */
  setConfig: (config: SiteConfig | null) => void;
  /** 获取完整的 API 基础 URL */
  getApiBaseUrl: () => string;
}

/**
 * 站点配置 Store
 *
 * 用于在客户端管理站点配置。
 * API URL 始终使用当前站点地址（window.location.origin）。
 *
 * 例如：部署在 blog.anheyu.com → API 请求发送到 blog.anheyu.com/api/*
 */
export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
  config: null,
  initialized: false,

  setConfig: (config: SiteConfig | null) => {
    set({
      config,
      initialized: true,
    });

    console.log("[SiteConfigStore] 站点配置已初始化:", {
      siteName: config?.APP_NAME,
    });
  },

  getApiBaseUrl: () => {
    // 始终使用当前站点地址（如 https://blog.anheyu.com）
    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    // SSR 时返回空字符串（服务端有自己的 API 调用方式）
    return "";
  },
}));

/**
 * 获取 API 基础 URL（非 hook 版本）
 * 用于 API 客户端等非组件场景
 */
export function getApiBaseUrl(): string {
  return useSiteConfigStore.getState().getApiBaseUrl();
}

/**
 * 检查配置是否已初始化
 */
export function isSiteConfigInitialized(): boolean {
  return useSiteConfigStore.getState().initialized;
}

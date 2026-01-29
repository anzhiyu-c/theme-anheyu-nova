/*
 * @Description: 全局 Provider
 * @Author: 安知鱼
 * @Date: 2026-01-23 17:03:10
 * @LastEditTime: 2026-01-28
 * @LastEditors: 安知鱼
 */
"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { QueryProvider } from "./query-provider";
import { useThemeStore, useSiteConfigStore } from "@/store";
import { SmoothScrollProvider } from "@/components/frontend/animations";
import type { SiteConfig } from "@/lib/api/types";

interface ProvidersProps {
  children: React.ReactNode;
  /** 服务端获取的站点配置，用于初始化客户端站点信息 */
  initialSiteConfig?: SiteConfig | null;
}

/**
 * 站点配置初始化组件
 * 将服务端传递的站点配置初始化到客户端 store
 */
function SiteConfigInitializer({ config }: { config: SiteConfig | null }) {
  const setConfig = useSiteConfigStore(state => state.setConfig);
  const initialized = useSiteConfigStore(state => state.initialized);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 只初始化一次，避免重复设置
    if (!hasInitialized.current && !initialized) {
      hasInitialized.current = true;
      setConfig(config);
    }
  }, [config, setConfig, initialized]);

  return null;
}

/**
 * 颜色主题初始化组件
 * 用于在客户端恢复用户选择的颜色主题
 */
function ColorThemeInitializer() {
  const colorTheme = useThemeStore(state => state.colorTheme);

  useEffect(() => {
    // 确保在客户端恢复主题
    document.documentElement.setAttribute("data-theme", colorTheme);
  }, [colorTheme]);

  return null;
}

/**
 * 应用加载完成标记组件
 * 设置 data-loaded 属性隐藏 Go 模板中的加载动画
 */
function AppLoadedMarker() {
  useEffect(() => {
    // 当 React 挂载完成后，设置 data-loaded 属性隐藏加载动画
    const nextRoot = document.getElementById("__next");
    if (nextRoot) {
      nextRoot.setAttribute("data-loaded", "true");
    }
  }, []);

  return null;
}

export function Providers({ children, initialSiteConfig }: ProvidersProps) {
  return (
    <QueryProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <HeroUIProvider>
          <SmoothScrollProvider>
            <SiteConfigInitializer config={initialSiteConfig || null} />
            <ColorThemeInitializer />
            <AppLoadedMarker />
            {children}
          </SmoothScrollProvider>
        </HeroUIProvider>
      </NextThemesProvider>
    </QueryProvider>
  );
}

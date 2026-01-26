/*
 * @Description: 全局 Provider
 * @Author: 安知鱼
 * @Date: 2026-01-23 17:03:10
 * @LastEditTime: 2026-01-24 16:04:37
 * @LastEditors: 安知鱼
 */
"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { QueryProvider } from "./query-provider";
import { useThemeStore } from "@/store";
import { SmoothScrollProvider } from "@/components/frontend/animations";

interface ProvidersProps {
  children: React.ReactNode;
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

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <HeroUIProvider>
          <SmoothScrollProvider>
            <ColorThemeInitializer />
            <AppLoadedMarker />
            {children}
          </SmoothScrollProvider>
        </HeroUIProvider>
      </NextThemesProvider>
    </QueryProvider>
  );
}

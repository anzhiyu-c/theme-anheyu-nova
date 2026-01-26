/*
 * @Description:
 * @Author: 安知鱼
 * @Date: 2026-01-24 16:03:49
 * @LastEditTime: 2026-01-25 13:46:47
 * @LastEditors: 安知鱼
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 可用的颜色主题
export const colorThemes = [
  {
    id: "mint",
    name: "薄荷绿",
    color: "#10b981",
    description: "清新自然的薄荷绿调",
  },
  {
    id: "blue",
    name: "天空蓝",
    color: "#3b82f6",
    description: "沉稳可靠的天蓝色调",
  },
  {
    id: "violet",
    name: "梦幻紫",
    color: "#8b5cf6",
    description: "神秘优雅的紫罗兰色调",
  },
  {
    id: "rose",
    name: "玫瑰红",
    color: "#f43f5e",
    description: "热情活力的玫瑰红调",
  },
  {
    id: "amber",
    name: "琥珀金",
    color: "#f59e0b",
    description: "温暖明亮的琥珀金调",
  },
  {
    id: "cyan",
    name: "青碧色",
    color: "#06b6d4",
    description: "清澈透亮的青碧色调",
  },
] as const;

export type ColorThemeId = (typeof colorThemes)[number]["id"];

interface ThemeState {
  // 颜色主题
  colorTheme: ColorThemeId;
  setColorTheme: (theme: ColorThemeId) => void;

  // 获取当前主题信息
  getCurrentTheme: () => (typeof colorThemes)[number];
}

export const useThemeStore = create<ThemeState>()(
  // @ts-ignore zustand 5.x 类型兼容问题
  persist(
    (set, get) => ({
      colorTheme: "mint" as ColorThemeId,

      setColorTheme: (theme: ColorThemeId) => {
        set({ colorTheme: theme });
        // 更新 DOM 的 data-theme 属性
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },

      getCurrentTheme: () => {
        const { colorTheme } = get();
        return colorThemes.find((t) => t.id === colorTheme) || colorThemes[0];
      },
    }),
    {
      name: "anheyu-theme-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ colorTheme: state.colorTheme }),
      onRehydrateStorage: () => (state) => {
        // 在 store 恢复后，同步 DOM 属性
        if (state && typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", state.colorTheme);
        }
      },
    }
  )
);

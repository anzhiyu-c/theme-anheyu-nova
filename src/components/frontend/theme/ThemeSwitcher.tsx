"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";
import { useThemeStore, colorThemes } from "@/store";

interface ThemeSwitcherProps {
  /** 是否显示标签文字 */
  showLabel?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 主题颜色切换器
 * 允许用户选择不同的主题配色方案
 */
export function ThemeSwitcher({ showLabel = false, className = "" }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colorTheme, setColorTheme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const currentTheme = colorThemes.find(t => t.id === colorTheme) || colorThemes[0];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 触发按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="切换主题颜色"
        aria-expanded={isOpen}
      >
        <div className="h-4 w-4 rounded-full transition-colors" style={{ backgroundColor: currentTheme.color }} />
        {showLabel && <span className="text-sm font-medium">{currentTheme.name}</span>}
        <Palette size={16} />
      </motion.button>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-xl"
          >
            <div className="mb-2 px-2 py-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">主题配色</h3>
            </div>

            <div className="space-y-1">
              {colorThemes.map(theme => {
                const isActive = colorTheme === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    onClick={() => {
                      setColorTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* 颜色圆点 */}
                    <div
                      className="relative h-8 w-8 flex-shrink-0 rounded-full shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: theme.color }}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check size={14} className="text-white drop-shadow" />
                        </motion.div>
                      )}
                    </div>

                    {/* 主题信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{theme.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{theme.description}</div>
                    </div>

                    {/* 选中指示器 */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* 底部提示 */}
            <div className="mt-2 border-t border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">选择你喜欢的配色方案，个性化你的阅读体验</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ThemeSwitcherCompactProps {
  className?: string;
  /** 是否在透明背景上显示 */
  isTransparent?: boolean;
}

/**
 * 紧凑版主题切换器
 * 仅显示颜色圆点，点击弹出选择面板
 */
export function ThemeSwitcherCompact({ className = "", isTransparent = false }: ThemeSwitcherCompactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colorTheme, setColorTheme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTheme = colorThemes.find(t => t.id === colorTheme) || colorThemes[0];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full transition-colors ${
          isTransparent
            ? "bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25"
            : "bg-secondary/60 border border-border/30 hover:bg-muted"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="切换主题颜色"
      >
        <div
          className={`h-4 w-4 md:h-5 md:w-5 rounded-full shadow-sm ${
            isTransparent ? "ring-2 ring-white/30" : "ring-2 ring-background"
          }`}
          style={{ backgroundColor: currentTheme.color }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-50 mt-2 flex gap-2 rounded-full border border-border bg-card/95 p-2 shadow-xl backdrop-blur-xl"
          >
            {colorThemes.map(theme => {
              const isActive = colorTheme === theme.id;
              return (
                <motion.button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className="relative"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  title={theme.name}
                >
                  <div
                    className={`h-7 w-7 rounded-full transition-all ${
                      isActive ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
                    }`}
                    style={{ backgroundColor: theme.color }}
                  />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check size={12} className="text-white drop-shadow" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { ThemeSwitcherCompact } from "@/components/frontend/theme";
import { useThemeStore, colorThemes } from "@/store";
import { useSiteConfig, useHydrated } from "@/hooks";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/about", label: "关于" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const colorTheme = useThemeStore(state => state.colorTheme);
  const currentColorTheme = colorThemes.find(t => t.id === colorTheme) || colorThemes[0];
  const { data: siteConfig } = useSiteConfig();
  const headerRef = useRef<HTMLElement>(null);
  const isHydrated = useHydrated();

  // 滚动动画效果
  const { scrollY } = useScroll();
  // 滚动 0-100px 时，缩放从 1 到 0.92
  const scale = useTransform(scrollY, [0, 100], [1, 0.92]);
  // 滚动 0-100px 时，高度从 64px 到 56px（移动端更紧凑）
  const headerHeight = useTransform(scrollY, [0, 100], [64, 56]);
  // padding 由 CSS 控制，支持响应式
  // 底部线条透明度
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 1]);

  // 检测是否在文章详情页
  const isPostDetailPage = pathname.startsWith("/posts/") && pathname !== "/posts";
  // 文章详情页顶部时的背景透明度
  const headerBgOpacity = useTransform(scrollY, [0, 150], [0, 0.8]);
  // 监听滚动位置
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isPostDetailPage) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPostDetailPage]);

  // 导航指示器位置状态 - 使用 ref 测量而非 layoutId
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // 站点名称和 logo
  const siteName = siteConfig?.APP_NAME || "安和鱼";
  const siteLogo = siteConfig?.LOGO_URL_192x192 || siteConfig?.LOGO_URL || "/static/img/logo-192x192.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // 锁定 body 滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // 计算导航指示器位置 - 使用 ref 测量而非 layoutId，避免多实例冲突
  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.href === pathname);
    if (activeIndex === -1) return;

    const activeEl = navItemRefs.current[activeIndex];
    const containerEl = navContainerRef.current;
    if (!activeEl || !containerEl) return;

    const containerRect = containerEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    setIndicatorStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [pathname, mounted]);

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={isHydrated ? { y: -100, opacity: 0 } : false}
        animate={isHydrated ? { y: 0, opacity: 1 } : false}
        transition={{
          duration: 0.5,
          ease: [0.32, 0.72, 0, 1],
        }}
        style={{
          height: headerHeight,
          backgroundColor: isPostDetailPage && !scrolled ? "transparent" : undefined,
          backdropFilter: isPostDetailPage && !scrolled ? "none" : undefined,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isPostDetailPage && !scrolled ? "" : "bg-background/80 backdrop-blur-xl"
        }`}
      >
        <nav className="relative mx-auto max-w-7xl h-full px-3 sm:px-4 md:px-6">
          <div className="flex h-full items-center justify-between">
            {/* Logo - 滚动缩放效果 */}
            <motion.div
              initial={isHydrated ? { opacity: 0, x: -20 } : false}
              animate={isHydrated ? { opacity: 1, x: 0 } : false}
              transition={{ duration: 0.5 }}
              style={{ scale }}
              className="origin-left"
            >
              <Link href="/" className="group flex items-center gap-2 md:gap-2.5" title="返回主页">
                <motion.div
                  className="relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl overflow-hidden"
                  style={{
                    background: siteLogo
                      ? "transparent"
                      : `linear-gradient(135deg, ${currentColorTheme.color}, ${currentColorTheme.color}dd)`,
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {siteLogo ? (
                    <img src={siteLogo} alt={siteName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base md:text-lg font-bold text-white">
                      {siteName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {/* 悬浮光晕效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `radial-gradient(circle at center, ${currentColorTheme.color}40 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <span
                  className={`text-base md:text-lg font-semibold transition-all duration-300 hover:opacity-80 ${
                    isPostDetailPage && !scrolled ? "text-white" : "text-foreground"
                  }`}
                >
                  {siteName}
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation - 精致的胶囊导航 */}
            <motion.div
              initial={isHydrated ? { opacity: 0, y: -10 } : false}
              animate={isHydrated ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex items-center"
            >
              <div
                ref={navContainerRef}
                className={`relative flex items-center gap-0.5 rounded-full p-1 transition-all duration-300 ${
                  isPostDetailPage && !scrolled ? "bg-white/15 backdrop-blur-md" : "bg-secondary/60"
                }`}
              >
                {/* 活跃指示器 - 使用绝对定位 + 动画，避免多实例 layoutId 冲突 */}
                {indicatorStyle.width > 0 && (
                  <motion.div
                    className={`absolute top-1 bottom-1 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                      isPostDetailPage && !scrolled ? "bg-white/20" : "bg-foreground/10"
                    }`}
                    initial={false}
                    animate={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                    }}
                  />
                )}
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      ref={el => {
                        navItemRefs.current[index] = el;
                      }}
                      className="relative block"
                    >
                      <motion.div
                        className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                          isPostDetailPage && !scrolled
                            ? isActive
                              ? "text-white"
                              : "text-white/70 hover:text-white"
                            : isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        whileHover={{ scale: isActive ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Section - 滚动缩放效果 */}
            <motion.div
              initial={isHydrated ? { opacity: 0, x: 20 } : false}
              animate={isHydrated ? { opacity: 1, x: 0 } : false}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ scale }}
              className="flex items-center gap-1 md:gap-1.5 origin-right"
            >
              {/* Color Theme Switcher - 移动端在菜单中显示 */}
              <ThemeSwitcherCompact isTransparent={isPostDetailPage && !scrolled} className="hidden md:block" />

              {/* Dark/Light Theme Toggle - 精致的切换动画 */}
              <motion.button
                onClick={toggleTheme}
                className={`relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full overflow-hidden transition-all duration-300 ${
                  isPostDetailPage && !scrolled
                    ? "bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25"
                    : "bg-secondary/60 text-muted-foreground border border-border/30 hover:bg-muted"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mounted && (
                    <motion.div
                      key={theme}
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                      className={isPostDetailPage && !scrolled ? "text-white" : "text-foreground"}
                    >
                      {theme === "dark" ? (
                        <Sun size={14} className="md:w-4 md:h-4" />
                      ) : (
                        <Moon size={14} className="md:w-4 md:h-4" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Toggle - 精致的汉堡菜单 */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full md:hidden overflow-hidden transition-all duration-300 ${
                  isPostDetailPage && !scrolled
                    ? "bg-white/15 backdrop-blur-md text-white border border-white/20"
                    : "bg-secondary/60 text-muted-foreground border border-border/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                <div className="relative w-3.5 h-2.5 flex flex-col justify-between">
                  <motion.span
                    className="block h-0.5 w-full bg-current rounded-full origin-center"
                    animate={isMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  />
                  <motion.span
                    className="block h-0.5 w-full bg-current rounded-full"
                    animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-0.5 w-full bg-current rounded-full origin-center"
                    animate={isMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  />
                </div>
              </motion.button>
            </motion.div>
          </div>
        </nav>

        {/* 底部渐变线 - Apple 风格 */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            opacity: borderOpacity,
            background: "linear-gradient(90deg, transparent, rgb(var(--border) / 0.3), transparent)",
          }}
        />
      </motion.header>

      {/* Mobile Menu Overlay - Apple 风格全屏菜单 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop - 模糊背景 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-xl md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel - 从顶部滑入 */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-2xl pt-16 pb-5 px-4 md:hidden border-b border-border/50 shadow-2xl"
            >
              <nav className="relative space-y-0">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{
                        delay: index * 0.06,
                        duration: 0.4,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                    >
                      <Link href={item.href} onClick={() => setIsMenuOpen(false)} className="relative block group">
                        <motion.div
                          className={`flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl transition-colors ${
                            isActive
                              ? "text-foreground bg-secondary/60 dark:bg-secondary/50"
                              : "text-foreground/70 dark:text-muted-foreground hover:text-foreground"
                          }`}
                          whileHover={{ backgroundColor: "rgb(var(--secondary) / 0.5)" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-base font-medium">{item.label}</span>
                          <motion.div
                            className="flex items-center gap-1.5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06 + 0.1 }}
                          >
                            {isActive && (
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: currentColorTheme.color }}
                                layoutId="mobile-nav-indicator"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            <motion.svg
                              className="w-3.5 h-3.5 text-foreground/30 dark:text-muted-foreground/50"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              initial={{ x: 0 }}
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </motion.svg>
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile Theme Controls - 紧凑控制区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4 pt-3 border-t border-border/50 dark:border-border/30 space-y-3"
              >
                {/* Color Theme - Apple 风格紧凑布局 */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-foreground/60 dark:text-muted-foreground/70">主题配色</span>
                  <div className="flex items-center gap-2.5">
                    {colorThemes.map((themeOption, index) => {
                      const isActiveTheme = colorTheme === themeOption.id;
                      return (
                        <motion.button
                          key={themeOption.id}
                          onClick={() => useThemeStore.getState().setColorTheme(themeOption.id)}
                          className="relative group flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.04 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={themeOption.name}
                        >
                          <div
                            className={`h-7 w-7 rounded-full transition-all ${
                              isActiveTheme
                                ? "ring-2 ring-foreground/70 ring-offset-2 ring-offset-background"
                                : "opacity-70 group-hover:opacity-100"
                            }`}
                            style={{ backgroundColor: themeOption.color }}
                          />
                          {isActiveTheme && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.15 }}
                            >
                              <svg
                                className="w-3.5 h-3.5 text-white drop-shadow"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Dark/Light Mode - Apple 风格紧凑切换 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/60 dark:text-muted-foreground/70">外观模式</span>
                  <motion.button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary/70 dark:bg-secondary/50 hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xs font-medium text-foreground/80">
                      {mounted && (theme === "dark" ? "深色" : "浅色")}
                    </span>
                    <motion.div className="flex h-5 w-5 items-center justify-center rounded-full bg-background/80 dark:bg-background/60">
                      <AnimatePresence mode="wait">
                        {mounted && (
                          <motion.div
                            key={theme}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-foreground"
                          >
                            {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer - 与 header 高度同步，文章详情页不需要 */}
      {!isPostDetailPage && <motion.div style={{ height: headerHeight }} />}
    </>
  );
}

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles, Zap, Heart, Code2 } from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ParallaxSection,
  CountUp,
  FloatingElement,
  Magnetic,
  ScrollZoomCard,
} from "@/components/frontend/animations";
import { ArticleCard } from "@/components/frontend/home";
import type { Article } from "@/lib/api/types";

interface HomeClientProps {
  articles: Article[];
}

export default function HomeClient({ articles: initialArticles }: HomeClientProps) {
  // 用于检测客户端 hydration 是否完成
  const [isHydrated, setIsHydrated] = useState(false);
  // 文章数据状态 - 支持客户端刷新
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const router = useRouter();

  // 客户端获取文章数据（用于 bfcache 恢复等场景）
  const fetchArticles = useCallback(async () => {
    try {
      const response = await fetch("/api/public/articles?page=1&pageSize=10");
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data?.list) {
          setArticles(data.data.list);
        }
      }
    } catch (error) {
      console.error("[HomeClient] Failed to fetch articles:", error);
    }
  }, []);

  useEffect(() => {
    setIsHydrated(true);

    // 监听 pageshow 事件，处理 bfcache 恢复
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // 页面从 bfcache 恢复，重新获取数据
        console.log("[HomeClient] Page restored from bfcache, refreshing data...");
        fetchArticles();
      }
    };

    // 监听 visibilitychange 事件，处理标签页切换回来的情况
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && articles.length === 0) {
        // 页面变为可见且数据为空，尝试刷新
        console.log("[HomeClient] Page became visible with empty data, refreshing...");
        fetchArticles();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 如果初始数据为空但页面应该有数据，尝试客户端获取
    if (initialArticles.length === 0) {
      fetchArticles();
    }

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchArticles, initialArticles.length, articles.length]);

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  // Hero 视差效果
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.95]);
  const heroBlur = useTransform(heroProgress, [0, 0.5], [0, 10]);
  // 将 blur 值转换为 CSS filter 字符串 - 必须在顶层调用，不能放在条件表达式中
  const heroBlurFilter = useTransform(heroBlur, v => `blur(${v}px)`);

  const smoothY = useSpring(heroY, { stiffness: 50, damping: 20 });
  const smoothOpacity = useSpring(heroOpacity, { stiffness: 50, damping: 20 });
  const smoothScale = useSpring(heroScale, { stiffness: 50, damping: 20 });

  // 叙事区域滚动
  const narrativeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: narrativeProgress } = useScroll({
    target: narrativeRef,
    offset: ["start end", "end start"],
  });

  const narrativeScale = useTransform(narrativeProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const narrativeOpacity = useTransform(narrativeProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div className="relative" style={{ position: "relative" }}>
      {/* Hero Section - Apple 风格大标题 */}
      <section
        ref={heroRef}
        className="flex min-h-[100svh] items-center justify-center overflow-hidden"
        style={{ position: "relative" }}
      >
        {/* 动态背景 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

          {/* 装饰性渐变球 - 使用主色，带动画 */}
          <FloatingElement duration={25} distance={40} className="absolute -left-40 top-20">
            <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/20 to-primary-400/20 blur-[120px]" />
          </FloatingElement>

          <FloatingElement duration={20} distance={30} className="absolute -right-40 bottom-20">
            <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary-300/15 to-primary-500/15 blur-[120px]" />
          </FloatingElement>

          {/* 额外的装饰元素 */}
          <FloatingElement duration={15} distance={20} className="absolute left-1/4 top-1/3">
            <div className="h-[200px] w-[200px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[80px]" />
          </FloatingElement>
        </div>

        {/* Hero 内容 */}
        <motion.div
          style={{
            y: smoothY,
            opacity: isHydrated ? smoothOpacity : 1,
            scale: isHydrated ? smoothScale : 1,
            // 使用预先定义的 heroBlurFilter（已在顶层用 useTransform 创建）
            filter: isHydrated ? heroBlurFilter : "none",
          }}
          className="relative z-10 mx-auto max-w-6xl px-4 text-center"
        >
          <motion.div
            initial={isHydrated ? { opacity: 0, y: 30, scale: 0.9 } : false}
            animate={isHydrated ? { opacity: 1, y: 0, scale: 1 } : false}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Magnetic strength={0.1}>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border/50 shadow-lg shadow-primary/5">
                <Sparkles size={14} className="text-primary animate-pulse" />
                探索思想的边界
              </span>
            </Magnetic>
          </motion.div>

          <motion.h1
            className="hero-title mb-8"
            initial={isHydrated ? { opacity: 0, y: 50 } : false}
            animate={isHydrated ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="block text-foreground mb-2">记录</span>
            <span className="block bg-gradient-to-r from-primary via-primary-400 to-primary-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              每一个灵感
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-14 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            initial={isHydrated ? { opacity: 0, y: 30 } : false}
            animate={isHydrated ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            技术、设计与生活的交汇点。
            <br className="hidden sm:block" />
            在这里，我分享对世界的观察与思考。
          </motion.p>

          <motion.div
            initial={isHydrated ? { opacity: 0, y: 20 } : false}
            animate={isHydrated ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Magnetic strength={0.15}>
              <Link
                href="#articles"
                className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/20 hover:scale-[1.02]"
              >
                开始阅读
                <ArrowDown size={16} className="transition-transform group-hover:translate-y-1" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.15}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 rounded-full border border-border bg-background/50 backdrop-blur-sm px-8 py-4 text-base font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30"
              >
                了解更多
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* 向下滚动提示 */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={isHydrated ? { opacity: 0 } : false}
          animate={isHydrated ? { opacity: 1 } : false}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground/60 tracking-widest uppercase">Scroll</span>
            <ArrowDown size={20} className="text-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Article - 第一篇文章大图展示 */}
      {featuredArticle && (
        <section className="relative py-24 md:py-40">
          <div className="mx-auto max-w-7xl px-4">
            <ScrollReveal>
              <div className="mb-16 flex items-end justify-between">
                <div>
                  <motion.span
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary mb-3"
                    initial={isHydrated ? { opacity: 0, x: -20 } : false}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <Zap size={14} />
                    精选文章
                  </motion.span>
                  <h2 className="text-4xl font-bold text-foreground md:text-5xl">最新创作</h2>
                </div>
                <Magnetic strength={0.2}>
                  <Link
                    href="/posts"
                    className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:flex group"
                  >
                    查看全部
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>

            <ScrollZoomCard scaleRange={[0.92, 1]}>
              <ArticleCard article={featuredArticle} index={0} variant="featured" />
            </ScrollZoomCard>
          </div>
        </section>
      )}

      {/* 数据展示 - 极简风格 */}
      <section ref={narrativeRef} className="relative py-32 md:py-40" style={{ position: "relative" }}>
        {/* SSR 优化：hydration 前使用普通 div 保持可见，hydration 后使用 motion.div 启用动画 */}
        {isHydrated ? (
          <motion.div
            className="relative mx-auto max-w-6xl px-4"
            style={{
              scale: narrativeScale,
              opacity: narrativeOpacity,
            }}
          >
            {/* 统计数据 - 横向排列 */}
            <div className="border-y border-border/40">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { number: 50, suffix: "+", label: "Articles" },
                  { number: 100, suffix: "K", label: "Words" },
                  { number: 365, suffix: "", label: "Days" },
                  { number: 0, suffix: "∞", label: "Ideas", isInfinity: true },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={`py-12 md:py-16 text-center ${index < 3 ? "border-r border-border/40" : ""} ${
                      index < 2 ? "border-b md:border-b-0 border-border/40" : ""
                    }`}
                    initial={isHydrated ? { opacity: 0, y: 20 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-foreground mb-2">
                      {stat.isInfinity ? (
                        stat.suffix
                      ) : (
                        <>
                          <CountUp end={stat.number} />
                          <span className="text-muted-foreground/50">{stat.suffix}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 简约引言 */}
            <motion.div
              className="mt-24 md:mt-32 text-center"
              initial={isHydrated ? { opacity: 0 } : false}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <p className="text-lg md:text-xl text-muted-foreground/80 font-light max-w-xl mx-auto leading-relaxed">
                Writing is thinking. Code is expression.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <div className="relative mx-auto max-w-6xl px-4">
            {/* 统计数据 - 横向排列 (SSR 静态版本) */}
            <div className="border-y border-border/40">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { number: 50, suffix: "+", label: "Articles" },
                  { number: 100, suffix: "K", label: "Words" },
                  { number: 365, suffix: "", label: "Days" },
                  { number: 0, suffix: "∞", label: "Ideas", isInfinity: true },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`py-12 md:py-16 text-center ${index < 3 ? "border-r border-border/40" : ""} ${
                      index < 2 ? "border-b md:border-b-0 border-border/40" : ""
                    }`}
                  >
                    <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-foreground mb-2">
                      {stat.isInfinity ? (
                        stat.suffix
                      ) : (
                        <>
                          <span>0</span>
                          <span className="text-muted-foreground/50">{stat.suffix}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 简约引言 (SSR 静态版本) */}
            <div className="mt-24 md:mt-32 text-center">
              <p className="text-lg md:text-xl text-muted-foreground/80 font-light max-w-xl mx-auto leading-relaxed">
                Writing is thinking. Code is expression.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Articles Grid - 文章网格 */}
      <section id="articles" className="relative py-24 md:py-40">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="mb-16">
              <motion.span
                className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary mb-3"
                initial={isHydrated ? { opacity: 0, x: -20 } : false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Code2 size={14} />
                所有文章
              </motion.span>
              <h2 className="text-4xl font-bold text-foreground md:text-5xl">最近更新</h2>
            </div>
          </ScrollReveal>

          {otherArticles.length > 0 ? (
            <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
              {otherArticles.map((article, index) => (
                <StaggerItem key={article.id}>
                  <ScrollZoomCard scaleRange={[0.95, 1]}>
                    <ArticleCard article={article} index={index} variant="normal" />
                  </ScrollZoomCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">暂无更多文章</p>
            </div>
          )}

          {articles.length > 0 && (
            <ScrollReveal delay={0.2}>
              <div className="mt-20 text-center">
                <Magnetic strength={0.15}>
                  <Link
                    href="/posts"
                    className="group inline-flex items-center gap-3 rounded-full border border-border px-10 py-5 text-base font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/10"
                  >
                    查看所有文章
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* 文章时间线 - 简约列表 */}
      {otherArticles.length > 3 && (
        <section className="relative bg-secondary/30 py-40 md:py-56">
          <ParallaxSection speed={0.1} className="absolute inset-0">
            <div className="absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
            <div className="absolute right-0 bottom-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
          </ParallaxSection>

          <div className="relative mx-auto max-w-4xl px-4">
            <ScrollReveal>
              <div className="mb-20 text-center">
                <motion.span
                  className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary mb-4"
                  initial={isHydrated ? { opacity: 0, y: 20 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Heart size={14} />
                  时间线
                </motion.span>
                <h2 className="text-4xl font-bold text-foreground md:text-5xl mb-6">创作足迹</h2>
                <p className="text-muted-foreground text-lg">按时间顺序浏览所有创作</p>
              </div>
            </ScrollReveal>

            <div className="space-y-0">
              {otherArticles.slice(0, 5).map((article, index) => (
                <ScrollReveal key={article.id} delay={index * 0.05}>
                  <ArticleCard article={article} index={index} variant="minimal" />
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.3}>
              <div className="mt-16 text-center">
                <Magnetic strength={0.2}>
                  <Link
                    href="/posts"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    查看更多
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* CTA Section - 结尾呼吁 */}
      <section className="relative overflow-hidden py-40 md:py-56">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-background to-background" />
          <ParallaxSection speed={-0.15} className="absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
          </ParallaxSection>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <ScrollReveal>
            <motion.h2
              className="mb-8 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
              initial={isHydrated ? { opacity: 0, y: 40 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              想法不会等待
            </motion.h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mb-14 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              订阅获取最新文章，或者直接开始探索。
              <br className="hidden sm:block" />
              每一次点击，都是一次新的发现。
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Magnetic strength={0.15}>
                <Link
                  href="/posts"
                  className="group inline-flex items-center gap-3 rounded-full bg-foreground px-10 py-5 text-base font-medium text-background transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/20 hover:scale-[1.02]"
                >
                  浏览所有文章
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 rounded-full border border-border bg-background/50 backdrop-blur-sm px-10 py-5 text-base font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30"
                >
                  关于我
                </Link>
              </Magnetic>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

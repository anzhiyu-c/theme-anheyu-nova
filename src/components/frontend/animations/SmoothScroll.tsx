"use client";

import { useEffect, useRef, createContext, useContext, ReactNode, useState, useCallback } from "react";
import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion";
import { useHydrated } from "@/hooks";

// ============================================
// 滚动上下文
// ============================================

interface ScrollContextValue {
  scrollY: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  isScrolling: boolean;
  scrollDirection: "up" | "down" | null;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within SmoothScrollProvider");
  }
  return context;
}

// ============================================
// 平滑滚动 Provider
// ============================================

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // 监听滚动方向
  useEffect(() => {
    const unsubscribe = scrollY.on("change", latest => {
      const direction = latest > lastScrollY.current ? "down" : "up";
      setScrollDirection(direction);
      lastScrollY.current = latest;
      setIsScrolling(true);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    });

    return () => unsubscribe();
  }, [scrollY]);

  return (
    <ScrollContext.Provider value={{ scrollY, scrollYProgress, isScrolling, scrollDirection }}>
      {children}
    </ScrollContext.Provider>
  );
}

// ============================================
// 滚动进度指示器
// ============================================

export function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary-400 to-primary origin-left z-[9999]"
      style={{ scaleX }}
    />
  );
}

// ============================================
// 滚动触发动画 Hook
// ============================================

interface UseScrollAnimationOptions {
  threshold?: number;
  once?: boolean;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.2, once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, isVisible };
}

// ============================================
// 滚动驱动的数值变换 Hook
// ============================================

interface UseScrollTransformOptions<T extends number | string> {
  inputRange?: [number, number];
  outputRange: [T, T];
}

export function useScrollTransformValue<T extends number | string>(
  ref: React.RefObject<HTMLElement>,
  options: UseScrollTransformOptions<T>
) {
  const { inputRange = [0, 1], outputRange } = options;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"] as const,
  });

  const value = useTransform(scrollYProgress, inputRange as number[], outputRange as T[]);
  const smoothValue = useSpring(value as never, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return smoothValue;
}

// ============================================
// 磁性吸附效果
// ============================================

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const x = (clientX - centerX) * strength;
      const y = (clientY - centerY) * strength;
      setPosition({ x, y });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 滚动显示文字（字符级动画）
// ============================================

interface CharacterRevealProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

/**
 * 滚动显示文字（字符级动画）
 *
 * SSG 优化：
 * - 不使用 initial 属性
 * - 只在 hydrated 且不可见时隐藏字符
 * - hydration 前字符保持可见
 */
export function CharacterReveal({ children, className = "", delay = 0, staggerDelay = 0.02 }: CharacterRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const isHydrated = useHydrated();
  const characters = children.split("");

  // 只有在 hydrated 且不可见时才隐藏
  const shouldHide = isHydrated && !isVisible;

  return (
    <motion.span ref={ref} className={`inline-block ${className}`}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          // 不使用 initial，完全通过 animate 控制
          animate={{
            opacity: shouldHide ? 0 : 1,
            y: shouldHide ? 20 : 0,
          }}
          transition={{
            duration: 0.4,
            delay: isVisible ? delay + index * staggerDelay : 0,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================
// 滚动缩放卡片
// ============================================

interface ScrollZoomCardProps {
  children: ReactNode;
  className?: string;
  scaleRange?: [number, number];
}

export function ScrollZoomCard({ children, className = "", scaleRange = [0.85, 1] }: ScrollZoomCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHydrated = useHydrated();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 1, 1]);

  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  // 在 hydration 之前，不应用滚动驱动的样式，保持内容可见
  // hydration 后启用滚动动画
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        scale: isHydrated ? smoothScale : 1,
        opacity: isHydrated ? smoothOpacity : 1,
        position: "relative",
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 滚动触发的数字计数
// ============================================

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ end, duration = 2, className = "", prefix = "", suffix = "" }: CountUpProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // 使用 easeOutExpo 缓动
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ============================================
// 滚动揭示效果（遮罩动画）
// ============================================

interface ScrollRevealMaskProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
}

export function ScrollRevealMask({ children, className = "", direction = "left" }: ScrollRevealMaskProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.3"] as const,
  });

  const getClipPathRange = (): [string, string] => {
    switch (direction) {
      case "left":
        return ["inset(0 100% 0 0)", "inset(0 0% 0 0)"];
      case "right":
        return ["inset(0 0 0 100%)", "inset(0 0 0 0%)"];
      case "top":
        return ["inset(0 0 100% 0)", "inset(0 0 0% 0)"];
      case "bottom":
        return ["inset(100% 0 0 0)", "inset(0% 0 0 0)"];
    }
  };

  const clipPath = useTransform(scrollYProgress, [0, 1], getClipPathRange());

  return (
    <div ref={ref} className={`overflow-hidden ${className}`} style={{ position: "relative" }}>
      <motion.div style={{ clipPath }}>{children}</motion.div>
    </div>
  );
}

// ============================================
// 3D 滚动卡片
// ============================================

interface Scroll3DCardProps {
  children: ReactNode;
  className?: string;
}

export function Scroll3DCard({ children, className = "" }: Scroll3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const smoothRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className="perspective-[1000px]" style={{ position: "relative" }}>
      <motion.div
        className={className}
        style={{
          rotateX: smoothRotateX,
          y: smoothY,
          opacity,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// 粘性滚动区块
// ============================================

interface StickyScrollSectionProps {
  children: ReactNode;
  className?: string;
  height?: string;
}

export function StickyScrollSection({ children, className = "", height = "300vh" }: StickyScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className={className} style={{ height, position: "relative" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <ScrollProgressContext.Provider value={scrollYProgress}>{children}</ScrollProgressContext.Provider>
      </div>
    </div>
  );
}

const ScrollProgressContext = createContext<MotionValue<number> | null>(null);

export function useStickyScrollProgress() {
  const progress = useContext(ScrollProgressContext);
  if (!progress) {
    throw new Error("useStickyScrollProgress must be used within StickyScrollSection");
  }
  return progress;
}

// ============================================
// 水平滚动画廊
// ============================================

interface HorizontalScrollGalleryProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScrollGallery({ children, className = "" }: HorizontalScrollGalleryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 });

  return (
    <section ref={ref} className={className} style={{ height: "300vh", position: "relative" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div className="flex gap-8 pl-[10vw]" style={{ x: smoothX }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// 弹性按钮效果
// ============================================

interface BouncyButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BouncyButton({ children, className = "", onClick }: BouncyButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// 浮动元素
// ============================================

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function FloatingElement({ children, className = "", duration = 6, distance = 20 }: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 光标跟随效果
// ============================================

interface CursorFollowerProps {
  className?: string;
}

export function CursorFollower({ className = "" }: CursorFollowerProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className={`fixed pointer-events-none z-[9998] ${className}`}
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
      }}
    >
      <div className="w-8 h-8 rounded-full border-2 border-primary/50" />
    </motion.div>
  );
}

// ============================================
// 滚动触发的分割线动画
// ============================================

interface AnimatedDividerProps {
  className?: string;
}

export function AnimatedDivider({ className = "" }: AnimatedDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.3"],
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={className} style={{ position: "relative" }}>
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-border to-transparent origin-center"
        style={{ scaleX }}
      />
    </div>
  );
}

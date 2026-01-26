"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView, useScroll, useTransform, Variants } from "framer-motion";
import { useHydrated } from "@/hooks";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
  threshold?: number;
}

/**
 * 滚动显示动画组件
 * Apple 风格的滚动进入动画
 *
 * SSG 优化方案：
 * - 不使用 initial 属性，避免在静态 HTML 中写入 opacity: 0
 * - 只使用 animate 属性控制状态
 * - hydration 前：元素保持可见（默认状态）
 * - hydration 后：根据 isInView 控制动画
 * - 这样即使 JS 加载失败，内容也始终可见
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 60,
  once = true,
  threshold = 0.2,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const isHydrated = useHydrated();

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { y: 0, x: distance };
      case "right":
        return { y: 0, x: -distance };
      case "none":
        return { y: 0, x: 0 };
    }
  };

  const offset = getInitialPosition();

  // 只有在 hydrated 且元素不在视口内时才应用隐藏状态
  // 其他所有情况（SSG、hydration 前、元素进入视口）都保持可见
  const shouldHide = isHydrated && !isInView;

  return (
    <motion.div
      ref={ref}
      className={className}
      // 不使用 initial，完全通过 animate 控制
      animate={{
        opacity: shouldHide ? 0 : 1,
        y: shouldHide ? offset.y : 0,
        x: shouldHide ? offset.x : 0,
      }}
      transition={{
        duration,
        // 只在进入视口时应用 delay，避免首次加载时的延迟
        delay: isInView ? delay : 0,
        ease: [0.25, 0.1, 0.25, 1], // Apple easing
      }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // 视差速度，负值向上，正值向下
  offset?: [string, string]; // 滚动范围
}

/**
 * 视差滚动组件
 * 创建 Apple 风格的视差效果
 */
export function ParallaxSection({
  children,
  className = "",
  speed = 0.5,
  offset = ["start end", "end start"],
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as ["start end" | "end start", "start end" | "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);

  return (
    <div ref={ref} className={className} style={{ position: "relative" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

/**
 * 交错动画容器
 * 子元素依次进入
 *
 * SSG 优化：
 * - 使用 variants 但不设置 initial 为 hidden
 * - 通过 animate 动态选择 variant
 * - hydration 前保持 visible 状态
 */
export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const isHydrated = useHydrated();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  // 只有在 hydrated 且不在视口时才使用 hidden
  // 否则使用 visible（包括 SSG 和 hydration 前）
  const animateState = isHydrated && !isInView ? "hidden" : "visible";

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      // 不设置 initial，让 animate 完全控制
      animate={animateState}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * 交错动画子项
 *
 * SSG 优化：
 * - 配合 StaggerContainer 使用
 * - 不单独设置 initial，继承父级状态
 * - 由父级的 animate 状态驱动动画
 */
export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // 不设置 initial，完全由父级 StaggerContainer 的 animate 状态控制
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

/**
 * 文字逐字显示动画
 * Apple 风格的文字进入效果
 *
 * SSG 优化：
 * - 不设置 initial 为 hidden
 * - 通过 animate 动态控制状态
 * - hydration 前文字保持可见
 */
export function TextReveal({ children, className = "", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const isHydrated = useHydrated();

  const words = children.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // 只有在 hydrated 且不在视口时才使用 hidden
  const animateState = isHydrated && !isInView ? "hidden" : "visible";

  return (
    <motion.div
      ref={ref}
      className={`flex flex-wrap ${className}`}
      variants={containerVariants}
      // 不设置 initial，让 animate 完全控制
      animate={animateState}
    >
      {words.map((word, index) => (
        <motion.span key={index} className="mr-[0.25em]" variants={wordVariants}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

interface ScaleOnScrollProps {
  children: ReactNode;
  className?: string;
}

/**
 * 滚动缩放动画
 * 随滚动放大/缩小
 */
export function ScaleOnScroll({ children, className = "" }: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={className} style={{ position: "relative" }}>
      <motion.div style={{ scale, opacity }}>{children}</motion.div>
    </div>
  );
}

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

/**
 * 水平滚动动画
 * 垂直滚动触发水平移动
 */
export function HorizontalScroll({ children, className = "" }: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`} style={{ position: "relative" }}>
      <motion.div style={{ x }} className="flex">
        {children}
      </motion.div>
    </div>
  );
}

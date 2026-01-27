"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Github,
  Twitter,
  Mail,
  MapPin,
  Calendar,
  Code2,
  Database,
  Cloud,
  Sparkles,
  Heart,
  BookOpen,
  Rocket,
  ArrowRight,
  ExternalLink,
  Eye,
  FileText,
  MessageSquare,
  Tag,
  FolderOpen,
  Globe,
  Terminal,
  Layers,
  GitBranch,
  MessageCircle,
  Send,
  Feather,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/frontend/animations";

// 导入 iconfont 样式
import "@/styles/iconfont-anzhiyu.css";

/**
 * 判断图片是否需要跳过 Next.js 优化
 */
function shouldSkipOptimization(src: string, siteUrl?: string): boolean {
  if (!src) return true;
  if (src.startsWith("/api/") || src.startsWith("/f/")) return true;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const url = new URL(src);
      const hostname = url.hostname;
      const allowedHostnames: string[] = ["localhost"];
      if (siteUrl) {
        try {
          const siteHostname = new URL(siteUrl).hostname;
          allowedHostnames.push(siteHostname);
          const parts = siteHostname.split(".");
          if (parts.length >= 2) {
            allowedHostnames.push(parts.slice(-2).join("."));
          }
        } catch {
          /* ignore */
        }
      }
      const isAllowed = allowedHostnames.some(allowed => hostname === allowed || hostname.endsWith("." + allowed));
      return !isAllowed;
    } catch {
      return true;
    }
  }
  return false;
}

/**
 * 判断字符串是否为图片 URL
 */
function isImageUrl(str: string): boolean {
  if (!str) return false;
  // 检查是否以 http/https 开头或是相对路径
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/")) {
    // 检查常见图片扩展名
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"];
    const lowerStr = str.toLowerCase();
    return (
      imageExtensions.some(ext => lowerStr.includes(ext)) || lowerStr.includes("/f/") || lowerStr.includes("/api/")
    );
  }
  return false;
}

/**
 * 判断字符串是否为 iconfont 类名
 */
function isIconFontClass(str: string): boolean {
  if (!str) return false;
  // 检查是否是 iconfont 类名格式（如 anzhiyu-icon-xxx, fa-xxx, iconfont-xxx）
  return str.startsWith("anzhiyu-icon-") || str.startsWith("fa-") || str.startsWith("iconfont");
}

// ========== 类型定义 ==========
interface AuthorInfo {
  name: string;
  avatar: string;
  description: string;
  subTitle: string;
  statusImg: string;
  skills: string[];
  social: Record<string, { icon: string; link: string }>;
  siteUrl: string;
}

interface Stats {
  totalArticles: number;
  totalWords: number;
  totalViews: number;
  totalComments: number;
  categoryCount: number;
  tagCount: number;
}

interface AboutContentProps {
  authorInfo: AuthorInfo;
  stats: Stats;
}

// ========== 技能数据 ==========
const skillGroups = [
  {
    category: "前端开发",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    items: [
      { name: "React / Next.js", level: 95 },
      { name: "Vue / Nuxt", level: 90 },
      { name: "TypeScript", level: 92 },
      { name: "Tailwind CSS", level: 95 },
    ],
  },
  {
    category: "后端开发",
    icon: Terminal,
    color: "from-emerald-500 to-teal-500",
    items: [
      { name: "Go / Gin", level: 88 },
      { name: "Node.js", level: 85 },
      { name: "Python", level: 80 },
      { name: "Rust", level: 70 },
    ],
  },
  {
    category: "数据库",
    icon: Database,
    color: "from-purple-500 to-pink-500",
    items: [
      { name: "PostgreSQL", level: 90 },
      { name: "MySQL", level: 88 },
      { name: "Redis", level: 85 },
      { name: "MongoDB", level: 80 },
    ],
  },
  {
    category: "DevOps",
    icon: Cloud,
    color: "from-orange-500 to-red-500",
    items: [
      { name: "Docker", level: 92 },
      { name: "Kubernetes", level: 85 },
      { name: "CI/CD", level: 88 },
      { name: "AWS / GCP", level: 82 },
    ],
  },
];

// ========== 时间线数据 ==========
const timeline = [
  {
    year: "2024",
    title: "全栈架构师",
    company: "独立开发者",
    description: "专注于开源项目和技术分享，打造高质量的博客系统和开发工具。",
    icon: Rocket,
    color: "bg-gradient-to-r from-primary to-primary-400",
  },
  {
    year: "2022",
    title: "高级全栈工程师",
    company: "科技公司",
    description: "负责核心业务系统架构设计和开发，带领团队完成多个重点项目。",
    icon: Layers,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    year: "2020",
    title: "全栈开发工程师",
    company: "互联网公司",
    description: "参与多个 Web 应用的开发，积累了丰富的前后端开发经验。",
    icon: GitBranch,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    year: "2018",
    title: "前端开发工程师",
    company: "创业公司",
    description: "从零开始学习前端开发，完成了第一个商业项目的交付。",
    icon: Code2,
    color: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
];

// ========== 社交图标映射 ==========
const socialIconMap: Record<string, LucideIcon> = {
  github: Github,
  twitter: Twitter,
  mail: Mail,
  email: Mail,
  weibo: Globe,
  zhihu: BookOpen,
  bilibili: Globe,
  qq: MessageCircle,
  wechat: MessageCircle,
  telegram: Send,
  discord: MessageCircle,
  linkedin: Globe,
  facebook: Globe,
  instagram: Globe,
  youtube: Globe,
  default: Globe,
};

// ========== 组件 ==========

// 数字动画组件
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView && value > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  // 格式化大数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return num.toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

// 技能进度条组件
function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">{name}</span>
        <span className="text-zinc-500 dark:text-zinc-400">{level}%</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary-400 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}

// 3D 卡片组件
function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      className={`perspective-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// 浮动背景装饰
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 小圆点装饰 */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-primary/10 dark:bg-primary/20"
          style={{ left: `${20 + i * 15}%`, top: `${10 + i * 20}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </div>
  );
}

// ========== 主组件 ==========
export default function AboutContent({ authorInfo, stats }: AboutContentProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  // 构建社交链接
  const socialLinks = Object.entries(authorInfo.social || {}).map(([key, value]) => {
    const iconValue = value.icon;
    const isImg = isImageUrl(iconValue);
    const isIconFont = isIconFontClass(iconValue);
    return {
      key,
      // 根据 icon 类型选择渲染方式
      iconComponent: !isImg && !isIconFont ? socialIconMap[key.toLowerCase()] || socialIconMap.default : null,
      iconUrl: isImg ? iconValue : null,
      iconFontClass: isIconFont ? iconValue : null,
      href: value.link,
      label: key,
    };
  });

  // 统计卡片数据
  const statsData = [
    { label: "文章", value: stats.totalArticles, icon: FileText },
    { label: "总字数", value: stats.totalWords, icon: Feather },
    { label: "阅读量", value: stats.totalViews, icon: Eye },
    { label: "评论", value: stats.totalComments, icon: MessageSquare },
  ];

  // 技术标签（优先使用配置中的 skills，否则使用默认）
  const techTags =
    authorInfo.skills.length > 0
      ? authorInfo.skills
      : [
          "React",
          "Vue",
          "Next.js",
          "Nuxt",
          "TypeScript",
          "Go",
          "Node.js",
          "PostgreSQL",
          "Redis",
          "Docker",
          "Kubernetes",
          "Tailwind CSS",
          "GraphQL",
          "REST API",
          "微服务",
          "CI/CD",
          "云原生",
          "性能优化",
        ];

  return (
    <div className="relative min-h-screen">
      {/* Hero 区域 */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <FloatingShapes />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* 头像 */}
            <Card3D className="inline-block mb-8">
              <div className="relative">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-primary via-primary-400 to-purple-500 p-1 shadow-2xl shadow-primary/30">
                  {authorInfo.avatar ? (
                    <Image
                      src={authorInfo.avatar}
                      alt={authorInfo.name}
                      width={176}
                      height={176}
                      className="w-full h-full rounded-full object-cover"
                      priority
                      unoptimized={shouldSkipOptimization(authorInfo.avatar, authorInfo.siteUrl)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                      <span className="text-5xl md:text-6xl font-bold gradient-text-primary">
                        {authorInfo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* 状态图片或装饰 */}
                {authorInfo.statusImg ? (
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-12 h-12"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* 使用 img 标签避免 Next.js 图片优化问题 */}
                    <img
                      src={authorInfo.statusImg}
                      alt=""
                      className="w-full h-full object-contain"
                      aria-hidden="true"
                    />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
              </div>
            </Card3D>

            {/* 标题 */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">你好，我是 </span>
              <span className="animated-gradient-text">{authorInfo.name}</span>
            </h1>

            {/* 副标题 */}
            {authorInfo.subTitle && (
              <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
                {authorInfo.subTitle}
              </p>
            )}

            {/* 描述 */}
            {authorInfo.description && (
              <div
                className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed prose prose-zinc dark:prose-invert prose-p:my-2 prose-b:text-foreground"
                dangerouslySetInnerHTML={{ __html: authorInfo.description }}
              />
            )}

            {/* 位置和时间 */}
            <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400 mb-10">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                中国
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                持续创作中
              </span>
            </div>

            {/* 社交链接 */}
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-center gap-4">
                {socialLinks.map(social => (
                  <motion.a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    {social.iconUrl ? (
                      <Image
                        src={social.iconUrl}
                        alt={social.label}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                        unoptimized={shouldSkipOptimization(social.iconUrl, authorInfo.siteUrl)}
                      />
                    ) : social.iconFontClass ? (
                      <i className={`anzhiyufont ${social.iconFontClass} text-xl`} />
                    ) : social.iconComponent ? (
                      <social.iconComponent size={20} />
                    ) : (
                      <Globe size={20} />
                    )}
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* 统计数据 */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-zinc-50/50 dark:to-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="glass-card-enhanced rounded-3xl p-6 text-center hover-lift">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold gradient-text-primary mb-2">
                      <AnimatedNumber value={stat.value} />
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          {/* 额外统计 */}
          <ScrollReveal delay={0.2}>
            <div className="mt-8 flex justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                {stats.categoryCount} 个分类
              </span>
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                {stats.tagCount} 个标签
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 技能展示 */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">技术栈</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                多年的开发经验让我掌握了丰富的技术栈，能够应对各种复杂的项目需求
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {skillGroups.map((skillGroup, groupIndex) => (
              <ScrollReveal key={skillGroup.category} delay={groupIndex * 0.1}>
                <div className="glass-card-enhanced rounded-3xl p-6 md:p-8 hover-lift">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${skillGroup.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <skillGroup.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{skillGroup.category}</h3>
                  </div>
                  <div className="space-y-4">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        delay={groupIndex * 0.2 + skillIndex * 0.1}
                      />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* 技术标签云 */}
          <ScrollReveal delay={0.4}>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {techTags.map((tag, index) => (
                <motion.span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 cursor-default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 时间线 */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-zinc-50/30 to-transparent dark:via-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">我的经历</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">每一步都是成长，每一次挑战都是机遇</p>
            </div>
          </ScrollReveal>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary-400 to-purple-500 transform md:-translate-x-1/2" />

            {timeline.map((item, index) => (
              <ScrollReveal key={item.year} delay={index * 0.15} direction={index % 2 === 0 ? "left" : "right"}>
                <div
                  className={`relative flex items-start gap-8 mb-12 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-zinc-900 transform -translate-x-1/2 z-10" />

                  <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="glass-card-enhanced rounded-2xl p-6 hover-lift">
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <div
                          className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg`}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-primary">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-primary/80 mb-3">{item.company}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 关于这个博客 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="glass-card-enhanced rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">关于这个博客</h2>
              </div>

              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  这是一个使用 <strong className="text-primary">Next.js</strong> 和
                  <strong className="text-primary"> HeroUI</strong> 构建的现代化博客平台。
                  我会在这里分享技术文章、开发经验和各种有趣的内容。
                </p>

                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  {[
                    { icon: BookOpen, title: "技术文章", desc: "深度技术分析和实践总结" },
                    { icon: Heart, title: "生活随笔", desc: "记录生活中的点滴感悟" },
                    { icon: Rocket, title: "项目分享", desc: "开源项目和工具推荐" },
                  ].map(item => (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 group hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                    >
                      <item.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 联系我 */}
      <section className="py-20 px-4 mb-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">保持联系</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                无论是技术交流、项目合作还是随便聊聊，都欢迎联系我
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "邮箱",
                value: "anzhiyu@anheyu.com",
                href: "mailto:anzhiyu@anheyu.com",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: MessageCircle,
                title: "微信",
                value: "扫码添加",
                href: "#",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Globe,
                title: "网站",
                value: authorInfo.siteUrl ? new URL(authorInfo.siteUrl).hostname : "blog.anheyu.com",
                href: authorInfo.siteUrl || "https://blog.anheyu.com",
                color: "from-purple-500 to-pink-500",
              },
            ].map((contact, index) => (
              <ScrollReveal key={contact.title} delay={index * 0.1}>
                <motion.a
                  href={contact.href}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block glass-card-enhanced rounded-2xl p-6 hover-lift group"
                  whileHover={{ y: -4 }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <contact.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{contact.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-primary transition-colors flex items-center gap-1">
                    {contact.value}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </motion.a>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA 按钮 */}
          <ScrollReveal delay={0.3}>
            <div className="flex justify-center mt-12">
              <motion.a
                href="mailto:anzhiyu@anheyu.com"
                className="btn-enhanced inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-400 text-white rounded-full font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                给我发邮件
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

"use client";

import { Card, CardBody } from "@heroui/react";
import { Github, Twitter, Mail, MapPin, Calendar } from "lucide-react";
import { DynamicSEO } from "@/components/frontend/seo";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 动态 SEO */}
      <DynamicSEO title="关于" />

      <h1 className="text-4xl font-bold mb-8 gradient-text">关于我</h1>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardBody className="flex flex-col md:flex-row items-center gap-8 p-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
            A
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Author</h2>
            <p className="text-zinc-500 mb-4">全栈开发者，热爱技术与创造</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                中国
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                2024年加入
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* About Content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <h2>关于这个博客</h2>
        <p>这是一个使用 Next.js 和 HeroUI 构建的现代化博客平台。</p>
        <p>在这里，我会分享技术文章、生活感悟和各种有趣的内容。</p>

        <h2>技能</h2>
        <ul>
          <li>前端开发：React、Vue、Next.js</li>
          <li>后端开发：Go、Node.js</li>
          <li>数据库：PostgreSQL、MySQL、Redis</li>
          <li>DevOps：Docker、Kubernetes</li>
        </ul>

        <h2>联系我</h2>
        <p>如果你有任何问题或合作意向，欢迎通过以下方式联系我。</p>
      </div>
    </div>
  );
}

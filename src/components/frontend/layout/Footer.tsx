/*
 * @Description:
 * @Author: 安知鱼
 * @Date: 2026-01-23 17:05:20
 * @LastEditTime: 2026-01-24 16:06:56
 * @LastEditors: 安知鱼
 */
"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";
import { useSiteConfig } from "@/hooks";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: siteConfig } = useSiteConfig();

  // 使用与 anheyu-pro 一致的字段名和默认值
  const siteName = siteConfig?.APP_NAME || "安和鱼";
  const siteDescription = siteConfig?.SITE_DESCRIPTION || "探索思想的边界，记录每一个灵感";
  const icpNumber = siteConfig?.ICP_NUMBER;

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
                {siteName}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">{siteDescription}</p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/posts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  所有文章
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  分类
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  标签
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  关于
                </Link>
              </li>
              <li>
                <a href="/rss.xml" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  RSS
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} {siteName}. 保留所有权利
          </p>
          {icpNumber && (
            <p className="text-center text-sm text-muted-foreground">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {icpNumber}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

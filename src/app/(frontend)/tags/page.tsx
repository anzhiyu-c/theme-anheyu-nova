/*
 * @Description:
 * @Author: 安知鱼
 * @Date: 2026-01-23 18:37:38
 * @LastEditTime: 2026-01-23 18:37:49
 * @LastEditors: 安知鱼
 */
"use client";

import Link from "next/link";
import { Chip, Skeleton } from "@heroui/react";
import { useTags } from "@/hooks";
import { DynamicSEO } from "@/components/frontend/seo";

export default function TagsPage() {
  const { data: tags, isLoading } = useTags("count");

  // Calculate font size based on article count
  const getTagSize = (count: number): "sm" | "md" | "lg" => {
    if (count >= 10) return "lg";
    if (count >= 5) return "md";
    return "sm";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 动态 SEO */}
      <DynamicSEO title="标签" />

      <h1 className="text-4xl font-bold mb-8 gradient-text text-center">文章标签</h1>

      {isLoading ? (
        <div className="flex flex-wrap gap-3">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="w-20 h-8 rounded-full" />
          ))}
        </div>
      ) : !tags || tags.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500">暂无标签</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <Link key={tag.id} href={`/posts?tag=${tag.id}`}>
              <Chip
                size={getTagSize(tag.article_count)}
                variant="flat"
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
                <span className="ml-1 text-xs opacity-60">({tag.article_count})</span>
              </Chip>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { useCategories } from "@/hooks";
import { Folder } from "lucide-react";
import { DynamicSEO } from "@/components/frontend/seo";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 动态 SEO */}
      <DynamicSEO title="分类" />

      <h1 className="text-4xl font-bold mb-8 gradient-text text-center">文章分类</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500">暂无分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link key={category.id} href={`/posts?category=${category.id}`}>
              <Card className="w-full hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                <CardBody className="flex flex-row items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Folder className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    {category.description && (
                      <p className="text-sm text-zinc-500 line-clamp-1">{category.description}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-1">{category.count} 篇文章</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

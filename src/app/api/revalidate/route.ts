/**
 * On-Demand Revalidation API
 *
 * Go 后端在以下情况调用此 API 清理缓存：
 * - 文章创建/更新/删除
 * - 站点配置变更
 * - 分类/标签变更
 *
 * 使用方法：
 * POST /api/revalidate
 * Headers: { "x-revalidate-token": "your-secret-token" }
 * Body: { "tags": ["articles", "article-xxx"] }
 *   或: { "paths": ["/", "/posts/xxx"] }
 *   或: { "all": true }
 */

import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// 验证 token（从环境变量获取）
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || "anheyu-revalidate-secret";

export async function POST(request: NextRequest) {
  // 验证 token
  const token = request.headers.get("x-revalidate-token");
  if (token !== REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const revalidated: string[] = [];

    // 清理所有缓存
    if (body.all === true) {
      const allTags = [
        "site-config",
        "articles",
        "home",
        "archives",
        "statistics",
        "categories",
        "tags",
        "friend-links",
      ];
      for (const tag of allTags) {
        revalidateTag(tag, "default");
        revalidated.push(`tag:${tag}`);
      }
      // 清理主要页面路径
      const mainPaths = ["/", "/posts", "/categories", "/tags", "/about"];
      for (const path of mainPaths) {
        revalidatePath(path, "page");
        revalidated.push(`path:${path}`);
      }
    }

    // 按标签清理
    if (body.tags && Array.isArray(body.tags)) {
      for (const tag of body.tags) {
        revalidateTag(tag, "default");
        revalidated.push(`tag:${tag}`);
      }
    }

    // 按路径清理
    if (body.paths && Array.isArray(body.paths)) {
      for (const path of body.paths) {
        revalidatePath(path, "page");
        revalidated.push(`path:${path}`);
      }
    }

    // 快捷方式：清理文章相关缓存
    if (body.article) {
      const slug = body.article;
      revalidateTag("articles", "default");
      revalidateTag(`article-${slug}`, "default");
      revalidateTag("home", "default");
      revalidateTag("archives", "default");
      revalidateTag("statistics", "default");
      revalidatePath("/", "page");
      revalidatePath("/posts", "page");
      revalidatePath(`/posts/${slug}`, "page");
      revalidated.push(`article:${slug}`);
    }

    // 快捷方式：清理站点配置缓存
    if (body.siteConfig === true) {
      revalidateTag("site-config", "default");
      revalidatePath("/", "page");
      revalidated.push("site-config");
    }

    // 快捷方式：清理分类缓存
    if (body.categories === true) {
      revalidateTag("categories", "default");
      revalidatePath("/categories", "page");
      revalidated.push("categories");
    }

    // 快捷方式：清理标签缓存
    if (body.tagsList === true) {
      revalidateTag("tags", "default");
      revalidatePath("/tags", "page");
      revalidated.push("tags");
    }

    console.log(`[Revalidate] Cleared cache:`, revalidated);

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Revalidate] Error:", error);
    return NextResponse.json({ error: "Failed to revalidate", details: String(error) }, { status: 500 });
  }
}

// GET 请求用于健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation API is ready",
    usage: {
      method: "POST",
      headers: { "x-revalidate-token": "your-secret-token" },
      body: {
        all: "boolean - 清理所有缓存",
        tags: "string[] - 按标签清理",
        paths: "string[] - 按路径清理",
        article: "string - 文章 slug，清理该文章相关缓存",
        siteConfig: "boolean - 清理站点配置缓存",
        categories: "boolean - 清理分类缓存",
        tagsList: "boolean - 清理标签缓存",
      },
    },
  });
}

import { NextResponse } from "next/server";

/**
 * 获取后端 API URL（运行时读取环境变量）
 */
function getBackendUrl(): string {
  return process.env.API_URL || process.env.BACKEND_URL || "http://localhost:8091";
}

/**
 * 将请求代理到 Go 后端并返回响应
 * 用于 RSS/Sitemap/robots.txt 等需要从后端获取的路由
 */
export async function proxyToBackend(path: string, contentType: string): Promise<NextResponse> {
  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}${path}`, {
      headers: {
        Accept: contentType,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse("Not Found", { status: res.status });
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error(`[Proxy] Failed to fetch ${path} from ${backendUrl}:`, error);
    return new NextResponse("Service Unavailable", { status: 503 });
  }
}

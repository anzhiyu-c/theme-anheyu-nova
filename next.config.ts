import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Next.js SSR 配置
const nextConfig: NextConfig = {
  // SSR 模式：使用 standalone 输出，便于 Docker 部署
  output: "standalone",

  // 图片优化配置
  images: {
    // SSR 模式下启用图片优化
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.anheyu.com",
      },
      {
        protocol: "https",
        hostname: "anheyu.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // 末尾斜杠配置
  trailingSlash: false,

  // 打包优化配置
  experimental: {
    // 优化包导入 - 自动 tree-shaking
    optimizePackageImports: ["lucide-react", "framer-motion", "@heroui/react"],
  },

  // 编译器优化
  compiler: {
    // 移除 console.log（生产环境）
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // 生产环境禁用 source maps（减小包体积）
  productionBrowserSourceMaps: false,

  // 压缩优化
  compress: true,

  // 严格模式
  reactStrictMode: true,

  // 注意：不要在这里设置 env.API_URL，因为它会在构建时被固化
  // Server Components 通过 process.env.API_URL 在运行时读取

  // 代理配置 - 客户端请求代理到 Go 后端
  // Next.js 作为唯一入口，所有后端请求通过 rewrites 代理
  async rewrites() {
    // 开发环境使用 BACKEND_URL，生产环境使用 API_URL（Docker 内部网络）
    // 默认使用 anheyu:8091，与 docker-compose.yml 中的服务名一致
    const backendUrl = isDev
      ? process.env.BACKEND_URL || "http://localhost:8091"
      : process.env.API_URL || "http://anheyu:8091";

    return {
      // beforeFiles: 在检查 public 目录之前执行（API 等必须代理的路径）
      beforeFiles: [
        // API 代理
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
        // 文件代理
        {
          source: "/f/:path*",
          destination: `${backendUrl}/f/:path*`,
        },
        // 缓存文件代理
        {
          source: "/needcache/:path*",
          destination: `${backendUrl}/needcache/:path*`,
        },
        // 后台管理代理
        {
          source: "/admin",
          destination: `${backendUrl}/admin`,
        },
        {
          source: "/admin/:path*",
          destination: `${backendUrl}/admin/:path*`,
        },
        // 登录页代理
        {
          source: "/login",
          destination: `${backendUrl}/login`,
        },
        // 后台静态资源代理
        {
          source: "/assets/:path*",
          destination: `${backendUrl}/assets/:path*`,
        },
        {
          source: "/admin-static/:path*",
          destination: `${backendUrl}/admin-static/:path*`,
        },
        {
          source: "/admin-assets/:path*",
          destination: `${backendUrl}/admin-assets/:path*`,
        },
      ],
      // afterFiles: SEO 和动态生成的文件（这些需要从后端获取）
      afterFiles: [
        // SEO 相关文件代理（动态生成）
        {
          source: "/sitemap.xml",
          destination: `${backendUrl}/sitemap.xml`,
        },
        {
          source: "/robots.txt",
          destination: `${backendUrl}/robots.txt`,
        },
        // RSS Feed 代理（动态生成）
        {
          source: "/rss.xml",
          destination: `${backendUrl}/rss.xml`,
        },
        {
          source: "/feed.xml",
          destination: `${backendUrl}/feed.xml`,
        },
        {
          source: "/atom.xml",
          destination: `${backendUrl}/atom.xml`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;

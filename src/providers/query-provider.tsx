"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 数据过期时间 5 分钟
            staleTime: 5 * 60 * 1000,
            // 缓存时间 30 分钟
            gcTime: 30 * 60 * 1000,
            // 失败重试次数
            retry: 1,
            // 窗口聚焦时重新获取
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

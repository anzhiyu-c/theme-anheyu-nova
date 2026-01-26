"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">页面未找到</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">抱歉，您访问的页面不存在</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button color="primary" startContent={<Home size={18} />}>
              返回首页
            </Button>
          </Link>
          <Button variant="bordered" startContent={<ArrowLeft size={18} />} onPress={handleGoBack}>
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  );
}

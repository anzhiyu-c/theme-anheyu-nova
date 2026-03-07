import { proxyToBackend } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

export async function GET() {
  return proxyToBackend("/robots.txt", "text/plain; charset=utf-8");
}

/**
 * API 客户端
 *
 * 始终使用当前站点地址作为 API 基础 URL。
 * 部署在 blog.anheyu.com 时，前端会自动请求 blog.anheyu.com/api/*
 */
import type { ApiResponse } from "./types";
import { getApiBaseUrl } from "@/store";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  /**
   * 获取当前的 API 基础 URL
   * 始终使用当前站点地址
   *
   * 例如：部署在 blog.anheyu.com → 返回 https://blog.anheyu.com/api
   */
  private getBaseUrl(): string {
    const apiUrl = getApiBaseUrl();
    return `${apiUrl}/api`;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const baseUrl = this.getBaseUrl();

    // baseUrl 现在总是完整的 URL（如 https://blog.anheyu.com/api）
    const url = new URL(`${baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

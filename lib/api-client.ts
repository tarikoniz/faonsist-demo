// ============================================
// API CLIENT - Fetch-based HTTP client
// Token yenileme (401 interceptor) destekli
// ============================================

import { ApiResponse, ApiError } from '@/types';
import { AUTH_TOKEN_KEY, AUTH_REFRESH_KEY, API_BASE_URL } from './constants';

interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  _retry?: boolean; // Token yenileme sonrası tekrar deneme flag'i
}

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const refreshToken = localStorage.getItem(AUTH_REFRESH_KEY);
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) return null;

      localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
      localStorage.setItem(AUTH_REFRESH_KEY, data.data.refreshToken);
      return data.data.token;
    } catch {
      return null;
    }
  }

  private async handleUnauthorized<T>(endpoint: string, config: RequestConfig, method: string, data?: any): Promise<ApiResponse<T> | null> {
    if (config._retry) return null; // Zaten tekrar denedik, döngüye girme

    // Eğer zaten yenileme yapılıyorsa kuyruğa ekle
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({
          resolve: (newToken: string) => {
            config._retry = true;
            config.headers = { ...config.headers, Authorization: `Bearer ${newToken}` };
            // Tekrar dene
            if (method === 'GET' || method === 'DELETE') {
              this.request<T>(endpoint, method, undefined, config).then(resolve).catch(reject);
            } else {
              this.request<T>(endpoint, method, data, config).then(resolve).catch(reject);
            }
          },
          reject,
        });
      });
    }

    this.isRefreshing = true;
    const newToken = await this.refreshAccessToken();
    this.isRefreshing = false;

    if (newToken) {
      // Kuyruktaki istekleri yeni token ile çöz
      this.refreshQueue.forEach((req) => req.resolve(newToken));
      this.refreshQueue = [];

      // Bu isteği tekrar dene
      const retryConfig: RequestConfig = { ...config, _retry: true };
      return this.request<T>(endpoint, method, data, retryConfig);
    } else {
      // Token yenileme başarısız — logout
      this.refreshQueue.forEach((req) => req.reject(new Error('Token yenileme başarısız')));
      this.refreshQueue = [];
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_KEY);
      return null;
    }
  }

  private async request<T>(endpoint: string, method: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = this.buildURL(endpoint, config?.params);
      const fetchConfig: RequestInit = {
        method,
        headers: this.buildHeaders(config?.headers),
        ...config,
      };
      if (data && method !== 'GET' && method !== 'DELETE') {
        fetchConfig.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchConfig);

      // 401 → Token yenile ve tekrar dene
      if (response.status === 401 && !config?._retry) {
        const retryResult = await this.handleUnauthorized<T>(endpoint, config || {}, method, data);
        if (retryResult) return retryResult;
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Ağ hatası oluştu',
        },
      };
    }
  }

  private buildHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let error: ApiError = {
        code: String(response.status),
        message: response.statusText || 'An error occurred',
      };

      if (isJson) {
        try {
          const errorData = await response.json();
          error = {
            code: errorData.code || error.code,
            message: errorData.message || error.message,
            details: errorData.details,
          };
        } catch (e) {
          // Use default error
        }
      }

      return {
        success: false,
        error,
      };
    }

    if (isJson) {
      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    }

    return {
      success: true,
      data: undefined as any,
    };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, config);
  }

  async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = this.buildURL(endpoint, config?.params);
      const token = this.getAuthToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { ...headers, ...config?.headers },
        body: formData,
        ...config,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient };

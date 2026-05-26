import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * API Response wrapper for type safety
 */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

/**
 * API Error structure
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Error handler class for consistent error management
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (data?.message as string) || error.message || "An error occurred";

    return new ApiError(
      status,
      message,
      data?.code as string | undefined,
      data?.details as Record<string, unknown> | undefined
    );
  }
}

/**
 * API Client with interceptors, error handling, and request/response transformation
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "") {
    this.baseURL = baseURL;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request id for tracing
        config.headers["X-Request-ID"] = this.generateRequestId();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 - unauthorized
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        // Handle 429 - rate limiting (retry with exponential backoff)
        if (error.response?.status === 429) {
          const retryAfter = parseInt(
            (error.response.headers["retry-after"] as string) || "1",
            10
          );
          await this.delay(retryAfter * 1000);
          return this.axiosInstance.request(error.config!);
        }

        return Promise.reject(ApiError.fromAxiosError(error));
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(
    url: string,
    config?: Parameters<AxiosInstance["get"]>[1]
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(
        url,
        config
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: Parameters<AxiosInstance["post"]>[2]
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: Parameters<AxiosInstance["put"]>[2]
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: Parameters<AxiosInstance["patch"]>[2]
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(
    url: string,
    config?: Parameters<AxiosInstance["delete"]>[1]
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(
        url,
        config
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      return ApiError.fromAxiosError(error);
    }

    return new ApiError(
      500,
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }

  /**
   * Handle unauthorized (401) - typically redirect to login
   */
  private handleUnauthorized(): void {
    if (typeof window !== "undefined") {
      // Clear auth state
      localStorage.removeItem("authToken");
      // Redirect to login
      window.location.href = "/auth";
    }
  }

  /**
   * Get stored auth token
   */
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility: delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  /**
   * Update base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.axiosInstance.defaults.baseURL = url;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

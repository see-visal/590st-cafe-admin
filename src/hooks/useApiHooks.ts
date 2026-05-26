import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiClient } from "@/lib/services/apiClient";

/**
 * Hook state type
 */
export interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook for fetching data
 */
export function useApi<T>(
  url: string | null,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetch = useCallback(async () => {
    if (!url) return;

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null,
    }));

    try {
      const data = await apiClient.get<T>(url);
      if (isMountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isError: false,
        });
        options?.onSuccess?.(data);
      }
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(500, "Unknown error");
      if (isMountedRef.current) {
        setState({
          data: null,
          error: apiError,
          isLoading: false,
          isError: true,
        });
        options?.onError?.(apiError);
      }
    }
  }, [url, options]);

  // Auto-fetch on mount or url change
  useEffect(() => {
    isMountedRef.current = true;

    if (options?.immediate !== false && url) {
      fetch();
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [url, fetch, options?.immediate]);

  return {
    ...state,
    refetch: fetch,
  };
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation<T, D = unknown>(
  method: "post" | "put" | "patch" | "delete",
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
  });

  const isMountedRef = useRef(true);

  const mutate = useCallback(
    async (url: string, data?: D) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
      }));

      try {
        let result: T;

        switch (method) {
          case "post":
            result = await apiClient.post<T>(url, data);
            break;
          case "put":
            result = await apiClient.put<T>(url, data);
            break;
          case "patch":
            result = await apiClient.patch<T>(url, data);
            break;
          case "delete":
            result = await apiClient.delete<T>(url);
            break;
        }

        if (isMountedRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isError: false,
          });
          options?.onSuccess?.(result);
        }
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError(500, "Unknown error");
        if (isMountedRef.current) {
          setState({
            data: null,
            error: apiError,
            isLoading: false,
            isError: true,
          });
          options?.onError?.(apiError);
        }
      }
    },
    [method, options]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    mutate,
  };
}

/**
 * Hook for paginated data fetching
 */
export interface PaginationOptions {
  pageSize?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function usePaginatedApi<T>(
  url: string | null,
  options?: {
    pageSize?: number;
    onSuccess?: (data: PaginatedResponse<T>) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize || 10;

  const paginatedUrl =
    url && `${url}?page=${page}&pageSize=${pageSize}`;

  const { data, error, isLoading, isError, refetch } = useApi<PaginatedResponse<T>>(
    paginatedUrl,
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );

  return {
    data,
    error,
    isLoading,
    isError,
    page,
    pageSize,
    setPage,
    refetch,
  };
}

import { createApiClient, getErrorMessage, isApiError } from '~/utils/api'
import type { ApiResponse } from '~/types'

/**
 * Composable for making API requests
 * Provides a configured API client with authentication and error handling
 */
export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Create API client with token getter
  const api = createApiClient(config.public.apiUrl, () => authStore.token)

  /**
   * Make an API request with automatic error handling
   */
  async function request<T>(
    url: string,
    options?: Parameters<typeof api>[1]
  ): Promise<T> {
    try {
      const response = await api<T>(url, options)
      return response
    } catch (error) {
      // Re-throw for caller to handle
      throw error
    }
  }

  /**
   * GET request
   */
  async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>(url, {
      method: 'GET',
      params,
    })
  }

  /**
   * POST request
   */
  async function post<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body,
    })
  }

  /**
   * PUT request
   */
  async function put<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body,
    })
  }

  /**
   * PATCH request
   */
  async function patch<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PATCH',
      body,
    })
  }

  /**
   * DELETE request
   */
  async function del<T>(url: string): Promise<T> {
    return request<T>(url, {
      method: 'DELETE',
    })
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    del,
    // Expose error helpers
    getErrorMessage,
    isApiError,
  }
}

// Cached API instance for $api helper (avoids creating new instance on every call)
let cachedApi: ReturnType<typeof useApi> | null = null

// Provide $api globally for convenience
export const $api = <T>(url: string, options?: Parameters<ReturnType<typeof useApi>['request']>[1]) => {
  if (!cachedApi) {
    cachedApi = useApi()
  }
  return cachedApi.request<T>(url, options)
}
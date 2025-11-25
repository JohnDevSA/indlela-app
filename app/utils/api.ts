import { ofetch, type FetchOptions } from 'ofetch'
import type { ApiError } from '~/types'

// Create configured API client
export const createApiClient = (baseURL: string, getToken: () => string | null) => {
  return ofetch.create({
    baseURL: `${baseURL}/api/v1`,
    retry: 3,
    retryDelay: 1000,

    async onRequest({ options }) {
      const token = getToken()
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // Add locale header
      const locale = useCookie('indlela_locale').value || 'en'
      options.headers = {
        ...options.headers,
        'Accept-Language': locale,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    },

    async onRequestError({ error }) {
      console.error('[API Request Error]', error)
    },

    async onResponse({ response }) {
      // Log successful responses in development
      if (import.meta.dev) {
        console.log('[API Response]', response.status, response._data)
      }
    },

    async onResponseError({ response }) {
      const error = response._data as ApiError

      // Handle specific error codes
      if (response.status === 401) {
        // Token expired or invalid - clear auth state
        const authStore = useAuthStore()
        authStore.logout()
        navigateTo('/auth/login')
      }

      console.error('[API Response Error]', error)
      throw error
    },
  })
}

// API error helper
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiError).error === 'object'
  )
}

// Extract error message from API error
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Extract validation errors from API error
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (isApiError(error) && error.error.details) {
    return error.error.details
  }
  return {}
}
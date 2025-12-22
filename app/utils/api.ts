import { ofetch, type FetchOptions } from 'ofetch'
import type { ApiError } from '~/types'

// Create configured API client
export const createApiClient = (baseURL: string, getToken: () => string | null) => {
  return ofetch.create({
    baseURL: `${baseURL}/api/v1`,
    retry: 3,
    retryDelay: 1000,

    async onRequest({ options }) {
      // Ensure headers object exists before spreading
      const existingHeaders = options.headers as Record<string, string> | undefined

      const token = getToken()
      const locale = useCookie('indlela_locale').value || 'en'

      options.headers = {
        ...(existingHeaders || {}),
        'Accept-Language': locale,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      // Handle 401: token expired or invalid
      if (response.status === 401) {
        const authStore = useAuthStore()
        // Only logout if still authenticated (prevents duplicate logout calls)
        if (authStore.isAuthenticated) {
          authStore.logout()
          navigateTo('/auth/login')
        }
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
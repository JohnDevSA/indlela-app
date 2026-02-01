import { ofetch, type FetchOptions } from 'ofetch'
import type { ApiError } from '~/types'
import { useAuthStore } from '~/stores/auth'

// Track if CSRF cookie has been fetched
let csrfInitialized = false

// Get XSRF token from cookie
function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  if (match) {
    // Cookie value is URL encoded
    return decodeURIComponent(match[1])
  }
  return null
}

// Initialize CSRF cookie from Laravel Sanctum
async function initCsrf(baseURL: string): Promise<void> {
  if (csrfInitialized) return

  try {
    await ofetch(`${baseURL}/sanctum/csrf-cookie`, {
      credentials: 'include',
    })
    csrfInitialized = true
  } catch (e) {
    console.error('[API] Failed to fetch CSRF cookie:', e)
  }
}

// Create configured API client
export const createApiClient = (baseURL: string, getToken: () => string | null) => {
  return ofetch.create({
    baseURL: `${baseURL}/api/v1`,
    retry: 3,
    retryDelay: 1000,
    credentials: 'include', // Include cookies for CSRF

    async onRequest({ options }) {
      // Initialize CSRF token if not done yet
      await initCsrf(baseURL)

      // Ensure headers object exists before spreading
      const existingHeaders = options.headers as Record<string, string> | undefined

      const token = getToken()
      const locale = useCookie('indlela_locale').value || 'en'
      const xsrfToken = getXsrfToken()

      options.headers = {
        ...(existingHeaders || {}),
        'Accept-Language': locale,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
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

// API error helper - validates full ApiError structure
export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  if (!('error' in error)) {
    return false
  }

  const errObj = (error as Record<string, unknown>).error
  if (typeof errObj !== 'object' || errObj === null) {
    return false
  }

  // Verify required message field exists and is a string
  return (
    'message' in errObj &&
    typeof (errObj as Record<string, unknown>).message === 'string'
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
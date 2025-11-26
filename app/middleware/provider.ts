import { useAuthStore } from '~/stores/auth'

/**
 * Provider middleware - requires provider role
 * Redirects to home if not a provider
 * In dev mode: allows access for UI development
 */
export default defineNuxtRouteMiddleware(() => {
  // Skip in dev mode for easier UI development
  if (process.dev) {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login', { replace: true })
  }

  if (!authStore.isProvider) {
    return navigateTo('/', { replace: true })
  }
})
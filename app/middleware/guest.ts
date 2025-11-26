import { useAuthStore } from '~/stores/auth'

/**
 * Guest middleware - only allows unauthenticated users
 * Redirects to home if already authenticated
 * In dev mode: allows access for UI development
 */
export default defineNuxtRouteMiddleware(() => {
  // Skip in dev mode for easier UI development
  if (process.dev) {
    return
  }

  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    // Redirect based on role
    if (authStore.isProvider) {
      return navigateTo('/provider-dashboard', { replace: true })
    }
    return navigateTo('/', { replace: true })
  }
})
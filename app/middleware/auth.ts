import { useAuthStore } from '~/stores/auth'

/**
 * Auth middleware - requires authentication
 * Redirects to login if not authenticated
 * In dev mode: allows access for UI development
 */
export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check in dev mode for easier UI development
  if (process.dev) {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login', {
      replace: true,
      redirectCode: 401,
    })
  }
})
import { useAuthStore } from '~/stores/auth'

/**
 * Admin middleware - only allows admin users
 * Redirects non-admins to appropriate page
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/', { replace: true })
  }

  // Check if user is admin
  if (!authStore.isAdmin) {
    // Redirect non-admin users to their appropriate dashboard
    if (authStore.isProvider) {
      return navigateTo('/provider-dashboard', { replace: true })
    }
    return navigateTo('/', { replace: true })
  }
})

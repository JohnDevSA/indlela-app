/**
 * Guest middleware - only allows unauthenticated users
 * Redirects to home if already authenticated
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    // Redirect based on role
    if (authStore.isProvider) {
      return navigateTo('/provider-dashboard', { replace: true })
    }
    return navigateTo('/', { replace: true })
  }
})
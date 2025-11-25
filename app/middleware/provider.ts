/**
 * Provider middleware - requires provider role
 * Redirects to home if not a provider
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login', { replace: true })
  }

  if (!authStore.isProvider) {
    return navigateTo('/', { replace: true })
  }
})
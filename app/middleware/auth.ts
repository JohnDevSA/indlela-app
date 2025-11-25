/**
 * Auth middleware - requires authentication
 * Redirects to login if not authenticated
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login', {
      replace: true,
      redirectCode: 401,
    })
  }
})
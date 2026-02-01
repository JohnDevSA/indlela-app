import { useAuthStore } from '~/stores/auth'

/**
 * Provider middleware - requires authentication and provider role
 * Redirects to auth if not authenticated, home if not a provider
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/', { replace: true })
  }

  // Check if user needs onboarding
  if (authStore.user && !authStore.user.onboardingCompleted) {
    if (to.path !== '/onboarding/provider') {
      return navigateTo('/onboarding/provider', { replace: true })
    }
    return
  }

  if (!authStore.isProvider) {
    return navigateTo('/', { replace: true })
  }
})
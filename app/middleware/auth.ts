import { useAuthStore } from '~/stores/auth'

/**
 * Auth middleware - requires authentication
 * Redirects to auth landing if not authenticated
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/', {
      replace: true,
    })
  }

  // Check if user needs onboarding
  if (authStore.user && !authStore.user.onboardingCompleted) {
    const onboardingPath = authStore.isProvider ? '/onboarding/provider' : '/onboarding/customer'
    if (to.path !== onboardingPath) {
      return navigateTo(onboardingPath, { replace: true })
    }
  }
})
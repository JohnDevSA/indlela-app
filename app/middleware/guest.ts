import { useAuthStore } from '~/stores/auth'

/**
 * Guest middleware - only allows unauthenticated users
 * Redirects authenticated users to appropriate dashboard
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    // Check if user needs onboarding
    if (authStore.user && !authStore.user.onboardingCompleted) {
      const onboardingPath = authStore.isProvider ? '/onboarding/provider' : '/onboarding/customer'
      return navigateTo(onboardingPath, { replace: true })
    }

    // Redirect based on role
    if (authStore.isProvider) {
      return navigateTo('/provider-dashboard', { replace: true })
    }
    return navigateTo('/', { replace: true })
  }
})
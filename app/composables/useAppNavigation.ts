/**
 * useAppNavigation - Navigation composable that works with Nuxt router
 *
 * Fixes the IonBackButton issue where Ionic's internal navigation stack
 * doesn't sync with Nuxt's router history.
 *
 * @example
 * const { goBack, canGoBack } = useAppNavigation()
 *
 * // In template with IonBackButton
 * <IonBackButton @click="goBack('/services')" default-href="/services" />
 *
 * // Or programmatically
 * if (canGoBack()) {
 *   goBack()
 * } else {
 *   goBack('/fallback-path')
 * }
 */
export const useAppNavigation = () => {
  const router = useRouter()

  /**
   * Check if browser history allows going back
   * Note: This checks browser history, not Ionic's stack
   */
  const canGoBack = (): boolean => {
    // In SSR, window is not available
    if (import.meta.server) return false

    // Check if there's history to go back to
    // history.length > 1 means there's at least one previous entry
    return window.history.length > 1
  }

  /**
   * Navigate back using browser history, with fallback to a default path
   *
   * @param defaultHref - Fallback path if no history exists
   * @param event - Optional click event to prevent default IonBackButton behavior
   */
  const goBack = (defaultHref?: string, event?: Event): void => {
    // Prevent IonBackButton's default behavior
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    // Try to use browser history first
    if (canGoBack()) {
      router.back()
    } else if (defaultHref) {
      // Fallback to default href
      router.push(defaultHref)
    } else {
      // Ultimate fallback - go to home
      router.push('/')
    }
  }

  /**
   * Navigate to a specific route, replacing current history entry
   * Useful for flows where you don't want the user to go back
   *
   * @param path - Path to navigate to
   */
  const replaceWith = (path: string): void => {
    router.replace(path)
  }

  /**
   * Navigate forward to a new route
   *
   * @param path - Path to navigate to
   */
  const navigateTo = (path: string): void => {
    router.push(path)
  }

  return {
    goBack,
    canGoBack,
    replaceWith,
    navigateTo,
    router,
  }
}
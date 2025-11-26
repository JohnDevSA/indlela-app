/**
 * useAnimation - Composable for consistent micro-interactions
 * Inspired by: Framer Motion, Linear, Apple HIG
 *
 * Provides haptic feedback, transition configs, and animation utilities
 * for creating delightful, responsive UI interactions
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// Animation presets for common use cases
export const ANIMATION_PRESETS = {
  // Entrance animations
  fadeIn: {
    initial: { opacity: 0 },
    enter: { opacity: 1 },
    duration: 200,
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    duration: 300,
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    enter: { opacity: 1, y: 0 },
    duration: 300,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    enter: { opacity: 1, scale: 1 },
    duration: 200,
  },
  spring: {
    initial: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1 },
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Exit animations
  fadeOut: {
    leave: { opacity: 0 },
    duration: 150,
  },
  slideOut: {
    leave: { opacity: 0, y: -10 },
    duration: 200,
  },

  // Interaction animations
  press: {
    scale: 0.98,
    duration: 100,
  },
  bounce: {
    scale: [1, 1.05, 0.95, 1],
    duration: 400,
  },
} as const

// Stagger delay calculator for list animations
export function staggerDelay(index: number, baseDelay = 50, maxDelay = 300): number {
  return Math.min(index * baseDelay, maxDelay)
}

export function useAnimation() {
  // Check if running on native platform
  const isNative = computed(() => {
    if (import.meta.client) {
      return window.Capacitor?.isNativePlatform() ?? false
    }
    return false
  })

  /**
   * Trigger haptic feedback
   * Falls back gracefully on web/unsupported devices
   */
  async function haptic(
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
  ) {
    if (!isNative.value) return

    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light })
          break
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium })
          break
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy })
          break
        case 'success':
          await Haptics.notification({ type: NotificationType.Success })
          break
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning })
          break
        case 'error':
          await Haptics.notification({ type: NotificationType.Error })
          break
      }
    } catch {
      // Silently fail - haptics not critical
    }
  }

  /**
   * Selection changed haptic (for toggles, selections)
   */
  async function hapticSelection() {
    if (!isNative.value) return
    try {
      await Haptics.selectionChanged()
    } catch {
      // Silently fail
    }
  }

  /**
   * Create a CSS transition string
   */
  function createTransition(
    properties: string | string[] = 'all',
    duration: number = 200,
    easing: string = 'cubic-bezier(0.4, 0, 0.2, 1)'
  ): string {
    const props = Array.isArray(properties) ? properties : [properties]
    return props.map((p) => `${p} ${duration}ms ${easing}`).join(', ')
  }

  /**
   * Vue transition component props for common animations
   */
  function getTransitionProps(preset: keyof typeof ANIMATION_PRESETS) {
    const config = ANIMATION_PRESETS[preset]
    return {
      enterActiveClass: 'transition-base',
      leaveActiveClass: 'transition-base',
      enterFromClass: 'opacity-0 transform',
      leaveToClass: 'opacity-0 transform',
    }
  }

  /**
   * Create staggered animation styles for list items
   */
  function staggeredStyle(index: number, baseDelay = 50) {
    return {
      animationDelay: `${staggerDelay(index, baseDelay)}ms`,
    }
  }

  /**
   * Intersection observer for scroll-triggered animations
   */
  function useScrollAnimation(
    target: Ref<HTMLElement | null>,
    options: {
      threshold?: number
      rootMargin?: string
      once?: boolean
    } = {}
  ) {
    const { threshold = 0.1, rootMargin = '0px', once = true } = options
    const isVisible = ref(false)
    const hasAnimated = ref(false)

    let observer: IntersectionObserver | null = null

    onMounted(() => {
      if (!target.value) return

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisible.value = true
              hasAnimated.value = true
              if (once && observer) {
                observer.disconnect()
              }
            } else if (!once) {
              isVisible.value = false
            }
          })
        },
        { threshold, rootMargin }
      )

      observer.observe(target.value)
    })

    onUnmounted(() => {
      observer?.disconnect()
    })

    return { isVisible, hasAnimated }
  }

  /**
   * Reduced motion preference check
   */
  const prefersReducedMotion = computed(() => {
    if (import.meta.client) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

  /**
   * Get appropriate duration based on reduced motion preference
   */
  function getDuration(normalDuration: number): number {
    return prefersReducedMotion.value ? 0 : normalDuration
  }

  return {
    // Haptics
    haptic,
    hapticSelection,

    // Animation utilities
    createTransition,
    getTransitionProps,
    staggeredStyle,
    staggerDelay,
    useScrollAnimation,

    // Preferences
    prefersReducedMotion,
    getDuration,

    // Presets
    presets: ANIMATION_PRESETS,
  }
}

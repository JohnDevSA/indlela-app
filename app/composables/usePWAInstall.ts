/**
 * Composable for PWA functionality
 * Handles installation prompts, updates, and offline status
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function usePWAInstall() {
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  const canInstall = ref(false)
  const isInstalled = ref(false)

  // Store the install prompt event
  let deferredPrompt: BeforeInstallPromptEvent | null = null

  // Check if app is already installed
  const checkIfInstalled = () => {
    if (typeof window === 'undefined') return false

    // Check display-mode media query (works when app is running as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Check iOS specific property
    const isIOSStandalone = (window.navigator as any).standalone === true

    // Check if launched from home screen on Android
    const isAndroidTWA = document.referrer.includes('android-app://')

    isInstalled.value = isStandalone || isIOSStandalone || isAndroidTWA
    return isInstalled.value
  }

  // Initialize PWA event listeners
  const initPWA = () => {
    if (typeof window === 'undefined') return

    // Check initial install status
    checkIfInstalled()

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Store the event for later use
      deferredPrompt = e
      // Update UI to show install button
      canInstall.value = true
    })

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      // Clear the deferred prompt
      deferredPrompt = null
      canInstall.value = false
      isInstalled.value = true
      console.log('[PWA] App installed successfully')
    })

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      isInstalled.value = e.matches
    })
  }

  // Trigger the install prompt
  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('[PWA] Install prompt not available')
      return false
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice

      // Clear the deferred prompt (can only be used once)
      deferredPrompt = null
      canInstall.value = false

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
        return true
      } else {
        console.log('[PWA] User dismissed the install prompt')
        return false
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error)
      return false
    }
  }

  // Update service worker
  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        needRefresh.value = false
        // Reload to activate new service worker
        window.location.reload()
      }
    }
  }

  // Close the refresh prompt without updating
  const closeRefreshPrompt = () => {
    needRefresh.value = false
  }

  // Get PWA display mode
  const getDisplayMode = (): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' => {
    if (typeof window === 'undefined') return 'browser'

    const displayModes = ['standalone', 'minimal-ui', 'fullscreen'] as const
    for (const mode of displayModes) {
      if (window.matchMedia(`(display-mode: ${mode})`).matches) {
        return mode
      }
    }
    return 'browser'
  }

  // Check if service worker is supported
  const isServiceWorkerSupported = () => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator
  }

  // Get service worker registration
  const getServiceWorkerRegistration = async () => {
    if (!isServiceWorkerSupported()) return null
    return navigator.serviceWorker.getRegistration()
  }

  // Initialize on mount
  onMounted(() => {
    initPWA()
  })

  return {
    // State
    needRefresh: readonly(needRefresh),
    offlineReady: readonly(offlineReady),
    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),

    // Actions
    installApp,
    updateServiceWorker,
    closeRefreshPrompt,
    checkIfInstalled,
    getDisplayMode,
    isServiceWorkerSupported,
    getServiceWorkerRegistration,
  }
}

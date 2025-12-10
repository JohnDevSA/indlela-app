/**
 * Status Bar Composable
 * Manages native status bar styling across iOS and Android
 * Ensures status bar matches the app's primary color theme
 */

import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

export const useStatusBar = () => {
  const isNative = Capacitor.isNativePlatform()

  /**
   * Initialize status bar with primary brand color
   * - Uses light text (white icons/text) on colored background
   * - Matches the primary green (#00A86B) from design tokens
   */
  const initStatusBar = async () => {
    if (!isNative) {
      // On web/PWA, the theme-color meta tag handles this
      return
    }

    try {
      // Set status bar style to light (white text/icons)
      await StatusBar.setStyle({ style: Style.Light })

      // Set background color to match primary brand color
      await StatusBar.setBackgroundColor({ color: '#00A86B' })

      // Show status bar if hidden
      await StatusBar.show()

      // On Android, enable overlay mode for edge-to-edge experience
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setOverlaysWebView({ overlay: false })
      }
    } catch (error) {
      console.error('Failed to initialize status bar:', error)
    }
  }

  /**
   * Update status bar color dynamically
   * Useful for pages with different header colors
   */
  const setStatusBarColor = async (color: string, style: Style = Style.Light) => {
    if (!isNative) return

    try {
      await StatusBar.setStyle({ style })
      await StatusBar.setBackgroundColor({ color })
    } catch (error) {
      console.error('Failed to set status bar color:', error)
    }
  }

  /**
   * Hide status bar (useful for immersive experiences)
   */
  const hideStatusBar = async () => {
    if (!isNative) return

    try {
      await StatusBar.hide()
    } catch (error) {
      console.error('Failed to hide status bar:', error)
    }
  }

  /**
   * Show status bar
   */
  const showStatusBar = async () => {
    if (!isNative) return

    try {
      await StatusBar.show()
    } catch (error) {
      console.error('Failed to show status bar:', error)
    }
  }

  return {
    initStatusBar,
    setStatusBarColor,
    hideStatusBar,
    showStatusBar,
    isNative,
  }
}

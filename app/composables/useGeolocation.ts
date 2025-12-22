import type { Coordinates } from '~/types'

// Geolocation will be loaded dynamically to avoid SSR issues

/**
 * Composable for geolocation operations
 * Works with Capacitor for native device location
 */
export function useGeolocation() {
  // State
  const coordinates = ref<Coordinates | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const permissionStatus = ref<'granted' | 'denied' | 'prompt'>('prompt')

  // Track permission listener for cleanup
  let permissionResult: PermissionStatus | null = null
  let permissionChangeHandler: (() => void) | null = null

  /**
   * Check location permission status
   */
  const checkPermission = async (): Promise<boolean> => {
    try {
      // For web/PWA, use browser API
      if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
        // Clean up any existing listener before adding new one
        if (permissionResult && permissionChangeHandler) {
          permissionResult.removeEventListener('change', permissionChangeHandler)
        }

        const result = await navigator.permissions.query({ name: 'geolocation' })
        permissionStatus.value = result.state as 'granted' | 'denied' | 'prompt'

        // Store reference for cleanup
        permissionResult = result
        permissionChangeHandler = () => {
          permissionStatus.value = result.state as 'granted' | 'denied' | 'prompt'
        }
        result.addEventListener('change', permissionChangeHandler)

        return result.state === 'granted'
      }

      // Fallback - assume permission available
      return true
    } catch {
      return true // Assume available, will fail at usage if not
    }
  }

  /**
   * Get current location
   */
  const getCurrentLocation = async (): Promise<Coordinates | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Use browser Geolocation API (works in both web and Capacitor)
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              coordinates.value = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              isLoading.value = false
              resolve(coordinates.value)
            },
            (err) => {
              error.value = getLocationErrorMessage(err.code)
              isLoading.value = false
              reject(new Error(error.value))
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000, // Cache for 1 minute
            }
          )
        })
      }

      error.value = 'Geolocation not supported'
      return null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to get location'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Watch location changes
   */
  const watchLocation = (callback: (coords: Coordinates) => void): (() => void) => {
    let watchId: number | undefined

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          coordinates.value = coords
          callback(coords)
        },
        (err) => {
          error.value = getLocationErrorMessage(err.code)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }

    // Return cleanup function
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }

  /**
   * Calculate distance between two coordinates (in km)
   * Uses Haversine formula
   */
  const calculateDistance = (from: Coordinates, to: Coordinates): number => {
    const R = 6371 // Earth's radius in km
    const dLat = toRadians(to.lat - from.lat)
    const dLng = toRadians(to.lng - from.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(from.lat)) *
        Math.cos(toRadians(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Format distance for display
   */
  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`
    }
    return `${km.toFixed(1)}km`
  }

  /**
   * Check if coordinates are within radius
   */
  const isWithinRadius = (
    center: Coordinates,
    point: Coordinates,
    radiusKm: number
  ): boolean => {
    return calculateDistance(center, point) <= radiusKm
  }

  // Helper functions
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180)
  }

  const getLocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied. Please enable location access.'
      case 2: // POSITION_UNAVAILABLE
        return 'Location unavailable. Please try again.'
      case 3: // TIMEOUT
        return 'Location request timed out. Please try again.'
      default:
        return 'Failed to get location.'
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Cleanup permission listener - call on component unmount
   */
  const cleanup = () => {
    if (permissionResult && permissionChangeHandler) {
      permissionResult.removeEventListener('change', permissionChangeHandler)
      permissionResult = null
      permissionChangeHandler = null
    }
  }

  // Computed
  const hasLocation = computed(() => coordinates.value !== null)
  const canRequestLocation = computed(() => permissionStatus.value !== 'denied')

  return {
    // State (readonly)
    coordinates: readonly(coordinates),
    isLoading: readonly(isLoading),
    error: readonly(error),
    permissionStatus: readonly(permissionStatus),

    // Computed
    hasLocation,
    canRequestLocation,

    // Methods
    checkPermission,
    getCurrentLocation,
    watchLocation,
    calculateDistance,
    formatDistance,
    isWithinRadius,
    clearError,
    cleanup,
  }
}
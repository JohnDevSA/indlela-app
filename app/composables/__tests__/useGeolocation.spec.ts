import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGeolocation } from '../useGeolocation'
import { BUSINESS_RULES } from '~/types'

/**
 * Tests for geolocation and service radius calculations
 * Critical for provider discovery and location-based services
 */
describe('useGeolocation Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crucial logic - distance calculation (Haversine formula)', () => {
    it('should calculate distance between two coordinates', () => {
      const { calculateDistance } = useGeolocation()

      // Johannesburg CBD to Soweto (approximately 20km)
      const jhbCbd = { lat: -26.2041, lng: 28.0473 }
      const soweto = { lat: -26.2678, lng: 27.8579 }

      const distance = calculateDistance(jhbCbd, soweto)

      // Allow for small margin of error
      expect(distance).toBeGreaterThan(19)
      expect(distance).toBeLessThan(21)
    })

    it('should calculate zero distance for same coordinates', () => {
      const { calculateDistance } = useGeolocation()

      const point = { lat: -26.2041, lng: 28.0473 }

      const distance = calculateDistance(point, point)

      expect(distance).toBe(0)
    })

    it('should calculate distance accurately for known coordinates', () => {
      const { calculateDistance } = useGeolocation()

      // Cape Town to Durban (approximately 1265km as the crow flies)
      const capeTown = { lat: -33.9249, lng: 18.4241 }
      const durban = { lat: -29.8587, lng: 31.0218 }

      const distance = calculateDistance(capeTown, durban)

      // Haversine formula gives approximately 1265km
      expect(distance).toBeGreaterThan(1200)
      expect(distance).toBeLessThan(1350)
    })

    it('should handle negative coordinates correctly', () => {
      const { calculateDistance } = useGeolocation()

      // Both coordinates are negative in South Africa
      const point1 = { lat: -26.2041, lng: 28.0473 }
      const point2 = { lat: -26.3041, lng: 28.1473 }

      const distance = calculateDistance(point1, point2)

      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(20) // Should be relatively close
    })

    it('should calculate distance between very close points', () => {
      const { calculateDistance } = useGeolocation()

      // Points approximately 111m apart (0.001 degree latitude ~ 111m)
      const point1 = { lat: -26.2041, lng: 28.0473 }
      const point2 = { lat: -26.2051, lng: 28.0473 }

      const distance = calculateDistance(point1, point2)

      // 0.001 degree latitude is approximately 0.111km (111 meters)
      expect(distance).toBeGreaterThan(0.1)
      expect(distance).toBeLessThan(0.15)
    })
  })

  describe('crucial logic - service radius validation', () => {
    it('should validate point is within default service radius (10km)', () => {
      const { isWithinRadius } = useGeolocation()

      const provider = { lat: -26.2041, lng: 28.0473 }
      const customer = { lat: -26.2541, lng: 28.0473 } // ~5.6km away

      const isWithin = isWithinRadius(
        provider,
        customer,
        BUSINESS_RULES.DEFAULT_SERVICE_RADIUS_KM
      )

      expect(isWithin).toBe(true)
    })

    it('should reject point outside service radius', () => {
      const { isWithinRadius } = useGeolocation()

      const provider = { lat: -26.2041, lng: 28.0473 } // Johannesburg CBD
      const customer = { lat: -26.2678, lng: 27.8579 } // Soweto (~20km away)

      const isWithin = isWithinRadius(
        provider,
        customer,
        BUSINESS_RULES.DEFAULT_SERVICE_RADIUS_KM
      )

      expect(isWithin).toBe(false)
    })

    it('should handle edge case at exact radius boundary', () => {
      const { calculateDistance, isWithinRadius } = useGeolocation()

      const center = { lat: -26.2041, lng: 28.0473 }
      // Calculate a point just under 10km away
      // Using approximation: 1 degree latitude ≈ 111km
      const radiusInDegrees = 9.9 / 111 // Slightly under 10km
      const boundary = { lat: center.lat + radiusInDegrees, lng: center.lng }

      const distance = calculateDistance(center, boundary)
      const isWithin = isWithinRadius(center, boundary, 10)

      // Distance should be approximately 9.9km (just under boundary)
      expect(distance).toBeGreaterThan(9)
      expect(distance).toBeLessThan(10)
      expect(isWithin).toBe(true)

      // Also test that exactly at or beyond boundary is outside
      const beyondRadius = 10.1 / 111
      const beyond = { lat: center.lat + beyondRadius, lng: center.lng }
      const isOutside = isWithinRadius(center, beyond, 10)
      expect(isOutside).toBe(false)
    })

    it('should validate same location is within radius', () => {
      const { isWithinRadius } = useGeolocation()

      const point = { lat: -26.2041, lng: 28.0473 }

      const isWithin = isWithinRadius(point, point, 10)

      expect(isWithin).toBe(true)
    })

    it('should respect custom service radius', () => {
      const { isWithinRadius } = useGeolocation()

      const provider = { lat: -26.2041, lng: 28.0473 }
      const customer = { lat: -26.2541, lng: 28.0473 } // ~5.6km away

      // Should be within 10km but not within 5km
      expect(isWithinRadius(provider, customer, 10)).toBe(true)
      expect(isWithinRadius(provider, customer, 5)).toBe(false)
    })
  })

  describe('usability - distance formatting', () => {
    it('should format distances less than 1km in meters', () => {
      const { formatDistance } = useGeolocation()

      expect(formatDistance(0.5)).toBe('500m')
      expect(formatDistance(0.123)).toBe('123m')
      expect(formatDistance(0.999)).toBe('999m')
    })

    it('should format distances 1km and above in kilometers', () => {
      const { formatDistance } = useGeolocation()

      expect(formatDistance(1)).toBe('1.0km')
      expect(formatDistance(5.678)).toBe('5.7km')
      expect(formatDistance(10.234)).toBe('10.2km')
      expect(formatDistance(100.5)).toBe('100.5km')
    })

    it('should round meters to nearest integer', () => {
      const { formatDistance } = useGeolocation()

      expect(formatDistance(0.1234)).toBe('123m')
      expect(formatDistance(0.5678)).toBe('568m')
    })

    it('should show 1 decimal place for km', () => {
      const { formatDistance } = useGeolocation()

      expect(formatDistance(1.234)).toBe('1.2km')
      expect(formatDistance(15.999)).toBe('16.0km')
    })
  })

  describe('crucial logic - location error handling', () => {
    it('should set error for permission denied', async () => {
      const mockNavigator = {
        geolocation: {
          getCurrentPosition: vi.fn((success, error) => {
            error({ code: 1, message: 'Permission denied' })
          }),
        },
      }

      global.navigator = mockNavigator as any

      const { getCurrentLocation, error } = useGeolocation()

      try {
        await getCurrentLocation()
      } catch {
        // Expected to throw
      }

      expect(error.value).toContain('Location permission denied')
    })

    it('should set error for position unavailable', async () => {
      const mockNavigator = {
        geolocation: {
          getCurrentPosition: vi.fn((success, error) => {
            error({ code: 2, message: 'Position unavailable' })
          }),
        },
      }

      global.navigator = mockNavigator as any

      const { getCurrentLocation, error } = useGeolocation()

      try {
        await getCurrentLocation()
      } catch {
        // Expected to throw
      }

      expect(error.value).toContain('Location unavailable')
    })

    it('should set error for timeout', async () => {
      const mockNavigator = {
        geolocation: {
          getCurrentPosition: vi.fn((success, error) => {
            error({ code: 3, message: 'Timeout' })
          }),
        },
      }

      global.navigator = mockNavigator as any

      const { getCurrentLocation, error } = useGeolocation()

      try {
        await getCurrentLocation()
      } catch {
        // Expected to throw
      }

      expect(error.value).toContain('Location request timed out')
    })

    it('should clear error state', async () => {
      const mockNavigator = {
        geolocation: {
          getCurrentPosition: vi.fn((success, error) => {
            error({ code: 1, message: 'Permission denied' })
          }),
        },
      }

      global.navigator = mockNavigator as any

      const { error, clearError, getCurrentLocation } = useGeolocation()

      try {
        await getCurrentLocation()
      } catch {
        // Expected to throw
      }

      // Error should be set
      expect(error.value).not.toBeNull()

      clearError()

      expect(error.value).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle coordinates at equator', () => {
      const { calculateDistance } = useGeolocation()

      const point1 = { lat: 0, lng: 0 }
      const point2 = { lat: 0, lng: 1 }

      const distance = calculateDistance(point1, point2)

      // At equator, 1 degree longitude ≈ 111km
      expect(distance).toBeGreaterThan(100)
      expect(distance).toBeLessThan(120)
    })

    it('should handle coordinates at poles', () => {
      const { calculateDistance } = useGeolocation()

      const northPole = { lat: 90, lng: 0 }
      const nearNorthPole = { lat: 89, lng: 0 }

      const distance = calculateDistance(northPole, nearNorthPole)

      // 1 degree latitude ≈ 111km
      expect(distance).toBeGreaterThan(100)
      expect(distance).toBeLessThan(120)
    })

    it('should handle coordinates across date line', () => {
      const { calculateDistance } = useGeolocation()

      const point1 = { lat: 0, lng: -179 }
      const point2 = { lat: 0, lng: 179 }

      const distance = calculateDistance(point1, point2)

      // Should calculate shortest distance (not wrapping around)
      expect(distance).toBeGreaterThan(0)
    })

    it('should handle very small distances', () => {
      const { calculateDistance } = useGeolocation()

      const point1 = { lat: -26.204100, lng: 28.047300 }
      const point2 = { lat: -26.204101, lng: 28.047301 }

      const distance = calculateDistance(point1, point2)

      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(0.001) // Less than 1 meter
    })

    it('should format zero distance', () => {
      const { formatDistance } = useGeolocation()

      expect(formatDistance(0)).toBe('0m')
    })

    it('should format very large distances', () => {
      const { formatDistance } = useGeolocation()

      expect(formatDistance(1000)).toBe('1000.0km')
      expect(formatDistance(12345.67)).toBe('12345.7km')
    })
  })

  describe('real-world scenarios', () => {
    it('should validate provider near customer in Soweto', () => {
      const { isWithinRadius } = useGeolocation()

      // Two locations in Soweto, approximately 2km apart
      const provider = { lat: -26.2678, lng: 27.8579 }
      const customer = { lat: -26.2500, lng: 27.8700 }

      const isWithin = isWithinRadius(
        provider,
        customer,
        BUSINESS_RULES.DEFAULT_SERVICE_RADIUS_KM
      )

      expect(isWithin).toBe(true)
    })

    it('should reject provider in Pretoria for customer in Johannesburg', () => {
      const { isWithinRadius, calculateDistance } = useGeolocation()

      const providerInPretoria = { lat: -25.7479, lng: 28.2293 }
      const customerInJhb = { lat: -26.2041, lng: 28.0473 }

      const distance = calculateDistance(providerInPretoria, customerInJhb)
      const isWithin = isWithinRadius(
        providerInPretoria,
        customerInJhb,
        BUSINESS_RULES.DEFAULT_SERVICE_RADIUS_KM
      )

      expect(distance).toBeGreaterThan(50) // ~55km actual distance
      expect(isWithin).toBe(false)
    })

    it('should validate multiple providers within radius', () => {
      const { isWithinRadius } = useGeolocation()

      const customer = { lat: -26.2041, lng: 28.0473 } // JHB CBD

      const providers = [
        { lat: -26.2100, lng: 28.0500 }, // ~0.8km
        { lat: -26.2200, lng: 28.0600 }, // ~2.5km
        { lat: -26.2400, lng: 28.0800 }, // ~5.5km
        { lat: -26.2800, lng: 28.1200 }, // ~11km
      ]

      const withinRadius = providers.map((provider) =>
        isWithinRadius(customer, provider, BUSINESS_RULES.DEFAULT_SERVICE_RADIUS_KM)
      )

      expect(withinRadius[0]).toBe(true)
      expect(withinRadius[1]).toBe(true)
      expect(withinRadius[2]).toBe(true)
      expect(withinRadius[3]).toBe(false) // Outside 10km
    })

    it('should calculate correct distances for township locations', () => {
      const { calculateDistance } = useGeolocation()

      // Known distances in Johannesburg area (as the crow flies)
      const locations = {
        jhbCbd: { lat: -26.2041, lng: 28.0473 },
        soweto: { lat: -26.2678, lng: 27.8579 },
        alexandraTownship: { lat: -26.1009, lng: 28.0990 },
        sandton: { lat: -26.1076, lng: 28.0567 },
      }

      // JHB CBD to Sandton (~11km as the crow flies)
      const distanceToSandton = calculateDistance(locations.jhbCbd, locations.sandton)
      expect(distanceToSandton).toBeGreaterThan(9)
      expect(distanceToSandton).toBeLessThan(13)

      // JHB CBD to Alexandra (~12km as the crow flies)
      const distanceToAlex = calculateDistance(locations.jhbCbd, locations.alexandraTownship)
      expect(distanceToAlex).toBeGreaterThan(10)
      expect(distanceToAlex).toBeLessThan(15)

      // JHB CBD to Soweto (~20km as the crow flies)
      const distanceToSoweto = calculateDistance(locations.jhbCbd, locations.soweto)
      expect(distanceToSoweto).toBeGreaterThan(18)
      expect(distanceToSoweto).toBeLessThan(22)
    })
  })

  describe('computed properties', () => {
    it('should compute hasLocation correctly after getting location', async () => {
      const mockNavigator = {
        geolocation: {
          getCurrentPosition: vi.fn((success) => {
            success({
              coords: { latitude: -26.2041, longitude: 28.0473 },
              timestamp: Date.now(),
            })
          }),
        },
      }

      global.navigator = mockNavigator as any

      const { hasLocation, getCurrentLocation } = useGeolocation()

      expect(hasLocation.value).toBe(false)

      await getCurrentLocation()

      expect(hasLocation.value).toBe(true)
    })

    it('should compute canRequestLocation based on permission after check', async () => {
      // Test with granted permission
      const mockNavigator1 = {
        permissions: {
          query: vi.fn().mockResolvedValue({
            state: 'granted',
            addEventListener: vi.fn(),
          }),
        },
        geolocation: {
          getCurrentPosition: vi.fn(),
        },
      }

      global.navigator = mockNavigator1 as any

      const geo1 = useGeolocation()
      await geo1.checkPermission()
      expect(geo1.canRequestLocation.value).toBe(true)

      // Test with denied permission
      const mockNavigator2 = {
        permissions: {
          query: vi.fn().mockResolvedValue({
            state: 'denied',
            addEventListener: vi.fn(),
          }),
        },
        geolocation: {
          getCurrentPosition: vi.fn(),
        },
      }

      global.navigator = mockNavigator2 as any

      const geo2 = useGeolocation()
      await geo2.checkPermission()
      expect(geo2.canRequestLocation.value).toBe(false)
    })
  })
})

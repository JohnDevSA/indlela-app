import type { Coordinates } from '~/types'

/**
 * Geocoding result from Nominatim/OpenStreetMap
 */
export interface GeocodingResult {
  township?: string
  suburb?: string
  city: string
  province?: string
  country?: string
  formattedAddress: string
  coordinates?: Coordinates
}

/**
 * Nominatim API response structure
 */
interface NominatimResponse {
  address: {
    suburb?: string
    city?: string
    town?: string
    municipality?: string
    city_district?: string
    county?: string
    state?: string
    country?: string
  }
  display_name: string
}

/**
 * Composable for reverse geocoding (coordinates to address)
 * Uses Nominatim/OpenStreetMap API (free, no API key required)
 */
export function useReverseGeocode() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<GeocodingResult | null>(null)

  /**
   * Reverse geocode coordinates to address
   * South African context-aware - extracts township, suburb, city
   */
  const reverseGeocode = async (
    coords: Coordinates
  ): Promise<GeocodingResult | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Use Nominatim (OpenStreetMap) API
      // Free tier has rate limit: 1 request/second
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Indlela/1.0.0', // Required by Nominatim
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }

      const data: NominatimResponse = await response.json()

      // Extract South African location components
      const geocodingResult: GeocodingResult = {
        township: extractTownship(data.address),
        suburb: data.address.suburb || data.address.city_district,
        city: extractCity(data.address),
        province: data.address.state,
        country: data.address.country,
        formattedAddress: data.display_name,
      }

      result.value = geocodingResult
      return geocodingResult
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to get location'
      error.value = message
      console.error('[ReverseGeocode] Error:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Extract township from address components
   * In South Africa, townships might appear as suburb, municipality, or city
   */
  const extractTownship = (
    address: NominatimResponse['address']
  ): string | undefined => {
    // Common SA townships to recognize
    const knownTownships = [
      'soweto',
      'khayelitsha',
      'alexandra',
      'tembisa',
      'mamelodi',
      'umlazi',
      'mdantsane',
      'mitchells plain',
      'gugulethu',
      'nyanga',
      'atteridgeville',
      'soshanguve',
      'sebokeng',
      'katlehong',
      'thokoza',
      'daveyton',
    ]

    // Check if suburb or municipality matches known townships
    const suburb = address.suburb?.toLowerCase()
    const municipality = address.municipality?.toLowerCase()
    const cityDistrict = address.city_district?.toLowerCase()

    if (suburb && knownTownships.includes(suburb)) {
      return address.suburb
    }

    if (municipality && knownTownships.includes(municipality)) {
      return address.municipality
    }

    if (cityDistrict && knownTownships.includes(cityDistrict)) {
      return address.city_district
    }

    // If not a known township, return suburb as township
    return address.suburb || address.municipality || address.city_district
  }

  /**
   * Extract city from address components
   */
  const extractCity = (address: NominatimResponse['address']): string => {
    // Prefer city, fallback to town or county
    return (
      address.city ||
      address.town ||
      address.municipality ||
      address.county ||
      'Unknown City'
    )
  }

  /**
   * Search for location by name (forward geocoding)
   * Useful for manual location search
   */
  const searchLocation = async (
    query: string
  ): Promise<GeocodingResult[]> => {
    isLoading.value = true
    error.value = null

    try {
      // Bias search to South Africa
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=za&limit=5`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Indlela/1.0.0',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to search location')
      }

      const data: Array<
        NominatimResponse & { lat: string; lon: string }
      > = await response.json()

      return data.map((item) => ({
        township: extractTownship(item.address),
        suburb: item.address.suburb || item.address.city_district,
        city: extractCity(item.address),
        province: item.address.state,
        country: item.address.country,
        formattedAddress: item.display_name,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      }))
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to search location'
      error.value = message
      console.error('[ReverseGeocode] Search error:', e)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    result: readonly(result),

    // Methods
    reverseGeocode,
    searchLocation,
    clearError,
  }
}

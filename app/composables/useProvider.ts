import type {
  Provider,
  Service,
  ServiceCategory,
  PaginatedResponse,
  Coordinates,
} from '~/types'
import {
  getCachedProviders,
  cacheProviders,
  getCachedServices,
  cacheServices,
} from '~/utils/offline-queue'

/**
 * Composable for provider and service operations
 * Handles provider discovery with offline caching
 */
export function useProvider() {
  const { get, getErrorMessage } = useApi()
  const { isOnline } = useOffline()

  // State
  const providers = ref<Provider[]>([])
  const services = ref<Service[]>([])
  const categories = ref<ServiceCategory[]>([])
  const currentProvider = ref<Provider | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch service categories
   */
  const fetchCategories = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Categories are usually small, always try API first
      if (isOnline.value) {
        const response = await get<{ data: ServiceCategory[] }>('/services')
        categories.value = response.data
      }
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch services with offline fallback
   */
  const fetchServices = async (categoryId?: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Load from cache first
      const cached = await getCachedServices()
      if (cached.length > 0) {
        services.value = categoryId
          ? cached.filter(s => s.categoryId === categoryId)
          : cached
      }

      // Fetch fresh if online
      if (isOnline.value) {
        const params = categoryId ? { category_id: categoryId } : undefined
        const response = await get<{ data: Service[] }>('/services/all', params)
        services.value = response.data

        // Update cache (store all services)
        await cacheServices(response.data)
      }
    } catch (e) {
      if (services.value.length === 0) {
        error.value = getErrorMessage(e)
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search providers with filters
   */
  const searchProviders = async (params: {
    serviceId?: string
    categoryId?: string
    location?: Coordinates
    radiusKm?: number
    rating?: number
    page?: number
  }): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Load from cache first
      const cached = await getCachedProviders()
      if (cached.length > 0) {
        // Apply local filters to cached data
        let filtered = cached

        if (params.serviceId) {
          filtered = filtered.filter(p =>
            p.services?.some(s => s.serviceId === params.serviceId)
          )
        }

        if (params.rating) {
          filtered = filtered.filter(p => p.rating >= params.rating!)
        }

        providers.value = filtered
      }

      // Fetch fresh if online
      if (isOnline.value) {
        const queryParams: Record<string, unknown> = {}

        if (params.serviceId) queryParams.service_id = params.serviceId
        if (params.categoryId) queryParams.category_id = params.categoryId
        if (params.location) {
          queryParams.lat = params.location.lat
          queryParams.lng = params.location.lng
        }
        if (params.radiusKm) queryParams.radius = params.radiusKm
        if (params.rating) queryParams.min_rating = params.rating
        if (params.page) queryParams.page = params.page

        const response = await get<PaginatedResponse<Provider>>('/providers', queryParams)
        providers.value = response.data

        // Update cache
        await cacheProviders(response.data)
      }
    } catch (e) {
      if (providers.value.length === 0) {
        error.value = getErrorMessage(e)
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single provider by ID
   */
  const fetchProvider = async (id: string): Promise<Provider | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      const cached = await getCachedProviders()
      const cachedProvider = cached.find(p => p.id === id)

      if (cachedProvider && !isOnline.value) {
        currentProvider.value = cachedProvider
        return cachedProvider
      }

      // Fetch from server
      if (isOnline.value) {
        const response = await get<{ data: Provider }>(`/providers/${id}`)
        currentProvider.value = response.data

        // Add to cache
        await cacheProviders([response.data])

        return response.data
      }

      return cachedProvider || null
    } catch (e) {
      error.value = getErrorMessage(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get providers near a location
   */
  const getNearbyProviders = async (
    location: Coordinates,
    radiusKm: number = 10
  ): Promise<void> => {
    return searchProviders({ location, radiusKm })
  }

  /**
   * Get providers by service category
   */
  const getProvidersByCategory = async (categoryId: string): Promise<void> => {
    return searchProviders({ categoryId })
  }

  /**
   * Get providers by specific service
   */
  const getProvidersByService = async (serviceId: string): Promise<void> => {
    return searchProviders({ serviceId })
  }

  /**
   * Get top-rated providers
   */
  const getTopProviders = async (limit: number = 10): Promise<void> => {
    return searchProviders({ rating: 4.5 })
  }

  /**
   * Filter providers locally
   */
  const filterProviders = (filters: {
    minRating?: number
    maxDistance?: number
    serviceId?: string
  }) => {
    return computed(() => {
      let filtered = providers.value

      if (filters.minRating) {
        filtered = filtered.filter(p => p.rating >= filters.minRating!)
      }

      if (filters.serviceId) {
        filtered = filtered.filter(p =>
          p.services?.some(s => s.serviceId === filters.serviceId)
        )
      }

      return filtered
    })
  }

  /**
   * Sort providers
   */
  const sortProviders = (by: 'rating' | 'reviews' | 'distance') => {
    return computed(() => {
      const sorted = [...providers.value]

      switch (by) {
        case 'rating':
          return sorted.sort((a, b) => b.rating - a.rating)
        case 'reviews':
          return sorted.sort((a, b) => b.totalReviews - a.totalReviews)
        default:
          return sorted
      }
    })
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State (readonly)
    providers: readonly(providers),
    services: readonly(services),
    categories: readonly(categories),
    currentProvider: readonly(currentProvider),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    fetchCategories,
    fetchServices,
    searchProviders,
    fetchProvider,
    getNearbyProviders,
    getProvidersByCategory,
    getProvidersByService,
    getTopProviders,
    filterProviders,
    sortProviders,
    clearError,
  }
}
import { defineStore } from 'pinia'
import type {
  Provider,
  Service,
  ProviderService,
  ProviderPreferences,
  PaginatedResponse,
  WeeklyAvailability,
} from '~/types'
import { getCachedProviders, cacheProviders } from '~/utils/offline-queue'

interface ProviderState {
  providers: Provider[]
  currentProvider: Provider | null
  services: Service[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedServiceId: string | null
  lastFetchedAt: Date | null
}

export const useProviderStore = defineStore('provider', {
  state: (): ProviderState => ({
    providers: [],
    currentProvider: null,
    services: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedServiceId: null,
    lastFetchedAt: null,
  }),

  getters: {
    /**
     * Get filtered providers based on search query
     */
    filteredProviders: (state): Provider[] => {
      if (!state.searchQuery) return state.providers

      const query = state.searchQuery.toLowerCase()
      return state.providers.filter(
        p =>
          p.user?.name.toLowerCase().includes(query) ||
          p.bio?.toLowerCase().includes(query) ||
          p.services?.some(s => s.service?.name.toLowerCase().includes(query))
      )
    },

    /**
     * Get providers offering a specific service
     */
    providersByService:
      (state) =>
      (serviceId: string): Provider[] => {
        return state.providers.filter(p =>
          p.services?.some(s => s.serviceId === serviceId)
        )
      },

    /**
     * Get top-rated providers
     */
    topRatedProviders: (state): Provider[] => {
      return [...state.providers]
        .filter(p => p.rating >= 4 && p.totalReviews >= 5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)
    },

    /**
     * Get verified providers only
     */
    verifiedProviders: (state): Provider[] => {
      return state.providers.filter(p => p.status === 'verified')
    },

    /**
     * Check if data is stale
     */
    isStale: (state): boolean => {
      if (!state.lastFetchedAt) return true
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return state.lastFetchedAt < fiveMinutesAgo
    },
  },

  actions: {
    /**
     * Fetch providers with optional filters
     */
    async fetchProviders(params?: {
      serviceId?: string
      lat?: number
      lng?: number
      radius?: number
      page?: number
    }) {
      this.isLoading = true
      this.error = null

      try {
        // Load from cache first
        const cached = await getCachedProviders()
        if (cached.length > 0) {
          this.providers = cached
        }

        // Fetch fresh data if online
        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { get } = useApi()
          const response = await get<PaginatedResponse<Provider>>('/providers', params)
          this.providers = response.data
          this.lastFetchedAt = new Date()

          // Cache providers
          await cacheProviders(response.data)
        }
      } catch (e) {
        if (this.providers.length === 0) {
          const { getErrorMessage } = useApi()
          this.error = getErrorMessage(e)
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch a single provider by ID
     */
    async fetchProvider(id: string): Promise<Provider | null> {
      this.isLoading = true
      this.error = null

      try {
        // Check cache first
        const cached = await getCachedProviders()
        const cachedProvider = cached.find(p => p.id === id)

        const { isOnline } = useOffline()
        if (!isOnline.value && cachedProvider) {
          this.currentProvider = cachedProvider
          return cachedProvider
        }

        if (isOnline.value) {
          const { get } = useApi()
          const response = await get<{ data: Provider }>(`/providers/${id}`)
          this.currentProvider = response.data
          return response.data
        }

        return cachedProvider || null
      } catch (e) {
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch provider's availability for a specific date
     */
    async fetchAvailability(
      providerId: string,
      date: string
    ): Promise<{ start: string; end: string }[]> {
      try {
        const { isOnline } = useOffline()
        if (!isOnline.value) {
          // Return default availability from cached provider
          const provider = this.currentProvider || this.providers.find(p => p.id === providerId)
          if (provider?.availability) {
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
            const dayAvailability = provider.availability[dayOfWeek as keyof WeeklyAvailability]
            if (dayAvailability?.enabled) {
              return [{ start: dayAvailability.start, end: dayAvailability.end }]
            }
          }
          return []
        }

        const { get } = useApi()
        const response = await get<{ data: { availableSlots: { start: string; end: string }[] } }>(
          `/providers/${providerId}/availability`,
          { date }
        )
        return response.data.availableSlots
      } catch {
        return []
      }
    },

    /**
     * Search providers
     */
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    /**
     * Select a service filter
     */
    setSelectedService(serviceId: string | null) {
      this.selectedServiceId = serviceId
    },

    /**
     * Fetch provider preferences
     */
    async fetchPreferences(providerId: string): Promise<ProviderPreferences | null> {
      try {
        const { isOnline } = useOffline()
        if (!isOnline.value) {
          // Return cached preferences if available
          const provider = this.currentProvider || this.providers.find(p => p.id === providerId)
          return provider?.preferences || null
        }

        const { get } = useApi()
        const response = await get<{ data: ProviderPreferences }>(`/providers/${providerId}/preferences`)

        // Update local provider state
        if (this.currentProvider?.id === providerId) {
          this.currentProvider.preferences = response.data
        }
        const providerIndex = this.providers.findIndex(p => p.id === providerId)
        if (providerIndex !== -1) {
          this.providers[providerIndex].preferences = response.data
        }

        return response.data
      } catch {
        return null
      }
    },

    /**
     * Update provider preferences (including auto-accept setting)
     */
    async updatePreferences(
      providerId: string,
      preferences: Partial<ProviderPreferences>
    ): Promise<boolean> {
      this.isLoading = true
      this.error = null

      // Optimistic update
      const originalPreferences = this.currentProvider?.preferences
      if (this.currentProvider?.id === providerId) {
        this.currentProvider.preferences = {
          ...this.currentProvider.preferences,
          ...preferences,
        } as ProviderPreferences
      }

      try {
        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { patch } = useApi()
          const response = await patch<{ data: ProviderPreferences }>(
            `/providers/${providerId}/preferences`,
            preferences
          )

          // Update with server response
          if (this.currentProvider?.id === providerId) {
            this.currentProvider.preferences = response.data
          }
          const providerIndex = this.providers.findIndex(p => p.id === providerId)
          if (providerIndex !== -1) {
            this.providers[providerIndex].preferences = response.data
          }
        }
        // Note: Offline queueing for preferences not implemented yet
        // as it's a provider setting that should be updated when online

        return true
      } catch (e) {
        // Rollback on error
        if (this.currentProvider?.id === providerId && originalPreferences) {
          this.currentProvider.preferences = originalPreferences
        }
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Toggle auto-accept setting (convenience method)
     */
    async toggleAutoAccept(providerId: string, enabled: boolean): Promise<boolean> {
      return this.updatePreferences(providerId, { autoAcceptEnabled: enabled })
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },

    /**
     * Reset store
     */
    $reset() {
      this.providers = []
      this.currentProvider = null
      this.services = []
      this.isLoading = false
      this.error = null
      this.searchQuery = ''
      this.selectedServiceId = null
      this.lastFetchedAt = null
    },
  },
})
import { defineStore } from 'pinia'
import type {
  Booking,
  BookingStatus,
  CreateBookingPayload,
  UpdateBookingPayload,
  PaginatedResponse,
} from '~/types'
import {
  queueAction,
  generateLocalId,
  addLocalBooking,
  updateSyncedBooking,
  getCachedBookings,
  cacheBookings,
} from '~/utils/offline-queue'
import { bookingLogger } from '~/utils/logger'

interface BookingState {
  bookings: Booking[]
  currentBooking: Booking | null
  isLoading: boolean
  error: string | null
  lastFetchedAt: Date | null
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  }),

  getters: {
    /**
     * Get upcoming bookings (future, not cancelled)
     */
    upcomingBookings: (state): Booking[] => {
      const now = new Date()
      return state.bookings
        .filter(b => new Date(b.scheduledAt) > now && b.status !== 'cancelled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    },

    /**
     * Get past bookings (completed, cancelled, or past date)
     */
    pastBookings: (state): Booking[] => {
      const now = new Date()
      return state.bookings
        .filter(
          b =>
            new Date(b.scheduledAt) <= now ||
            b.status === 'completed' ||
            b.status === 'cancelled'
        )
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    },

    /**
     * Get bookings by status
     */
    getByStatus:
      (state) =>
      (status: BookingStatus): Booking[] => {
        return state.bookings.filter(b => b.status === status)
      },

    /**
     * Get pending bookings count
     */
    pendingCount: (state): number => {
      return state.bookings.filter(b => b.status === 'pending').length
    },

    /**
     * Get active bookings count (accepted or in_progress)
     */
    activeCount: (state): number => {
      return state.bookings.filter(
        b => b.status === 'accepted' || b.status === 'in_progress'
      ).length
    },

    /**
     * Check if data is stale (older than 5 minutes)
     */
    isStale: (state): boolean => {
      if (!state.lastFetchedAt) return true
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return state.lastFetchedAt < fiveMinutesAgo
    },
  },

  actions: {
    /**
     * Fetch user's bookings with offline fallback
     */
    async fetchBookings(params?: { status?: BookingStatus; page?: number }) {
      this.isLoading = true
      this.error = null

      try {
        // Load from cache first for instant UI
        const cached = await getCachedBookings()
        if (cached.length > 0) {
          this.bookings = cached
          bookingLogger.debug('Loaded bookings from cache', { count: cached.length })
        }

        // If online, fetch fresh data
        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { get } = useApi()
          const response = await get<PaginatedResponse<Booking>>('/bookings', params)
          this.bookings = response.data
          this.lastFetchedAt = new Date()

          // Update cache
          await cacheBookings(response.data)
          bookingLogger.info('Fetched bookings from API', { count: response.data.length })
        }
      } catch (e) {
        // If we have cached data, don't show error
        if (this.bookings.length === 0) {
          const { getErrorMessage } = useApi()
          this.error = getErrorMessage(e)
          bookingLogger.error('Failed to fetch bookings', e)
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch a single booking by ID
     */
    async fetchBooking(id: string): Promise<Booking | null> {
      this.isLoading = true
      this.error = null

      try {
        // Check cache first
        const cached = await getCachedBookings()
        const cachedBooking = cached.find(b => b.id === id || b.offlineId === id)

        const { isOnline } = useOffline()
        if (!isOnline.value && cachedBooking) {
          this.currentBooking = cachedBooking
          return cachedBooking
        }

        // Fetch from server if online
        if (isOnline.value) {
          const { get } = useApi()
          const response = await get<{ data: Booking }>(`/bookings/${id}`)
          this.currentBooking = response.data
          return response.data
        }

        return cachedBooking || null
      } catch (e) {
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        bookingLogger.error('Failed to fetch booking', e, { bookingId: id })
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create a new booking with offline support
     */
    async createBooking(data: CreateBookingPayload): Promise<Booking | null> {
      this.isLoading = true
      this.error = null

      const localId = generateLocalId()

      // Create optimistic booking
      const optimisticBooking: Booking = {
        id: localId,
        customerId: '',
        providerId: data.providerId,
        serviceId: data.serviceId,
        locationId: '',
        status: 'pending',
        scheduledAt: data.scheduledAt,
        quotedAmount: 0,
        customerNotes: data.notes,
        offlineId: localId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      try {
        // Add to state immediately (optimistic UI)
        this.bookings.unshift(optimisticBooking)
        this.currentBooking = optimisticBooking

        // Save to IndexedDB
        await addLocalBooking(optimisticBooking, localId)
        bookingLogger.debug('Created local booking', { localId })

        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { post } = useApi()
          const response = await post<{ data: Booking }>('/bookings', {
            ...data,
            offline_id: localId,
          })

          // Update with server response
          const serverBooking = response.data
          const index = this.bookings.findIndex(b => b.id === localId)
          if (index !== -1) {
            this.bookings[index] = serverBooking
          }
          this.currentBooking = serverBooking

          // Update IndexedDB
          await updateSyncedBooking(localId, serverBooking.id, serverBooking)
          bookingLogger.info('Booking synced to server', {
            localId,
            serverId: serverBooking.id,
          })

          return serverBooking
        } else {
          // Queue for later sync
          await queueAction('CREATE_BOOKING', { ...data, localId })
          bookingLogger.info('Booking queued for offline sync', { localId })
          return optimisticBooking
        }
      } catch (e) {
        // Remove optimistic booking on error
        this.bookings = this.bookings.filter(b => b.id !== localId)
        this.currentBooking = null
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        bookingLogger.error('Failed to create booking', e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update an existing booking
     */
    async updateBooking(id: string, data: UpdateBookingPayload): Promise<Booking | null> {
      this.isLoading = true
      this.error = null

      const index = this.bookings.findIndex(b => b.id === id)
      const originalBooking = index !== -1 ? { ...this.bookings[index] } : null

      try {
        // Optimistic update
        if (index !== -1) {
          this.bookings[index] = { ...this.bookings[index], ...data }
        }

        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { put } = useApi()
          const response = await put<{ data: Booking }>(`/bookings/${id}`, data)
          if (index !== -1) {
            this.bookings[index] = response.data
          }
          return response.data
        } else {
          await queueAction('UPDATE_BOOKING', { id, ...data })
          return this.bookings[index] || null
        }
      } catch (e) {
        // Rollback on error
        if (originalBooking && index !== -1) {
          this.bookings[index] = originalBooking
        }
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Reschedule a booking to a new date/time
     * Notifies the other party (customer or provider)
     */
    async rescheduleBooking(
      id: string,
      newScheduledAt: string,
      rescheduledBy: 'customer' | 'provider'
    ): Promise<Booking | null> {
      this.isLoading = true
      this.error = null

      const index = this.bookings.findIndex(b => b.id === id)
      const originalBooking = index !== -1 ? { ...this.bookings[index] } : null

      // Validate status allows rescheduling
      if (originalBooking && !['pending', 'accepted'].includes(originalBooking.status)) {
        this.error = 'Cannot reschedule a booking that is in progress, completed, or cancelled'
        this.isLoading = false
        return null
      }

      try {
        // Optimistic update
        if (index !== -1) {
          this.bookings[index] = {
            ...this.bookings[index],
            scheduledAt: newScheduledAt,
            updatedAt: new Date().toISOString(),
          }
        }

        const payload = {
          scheduledAt: newScheduledAt,
          rescheduledBy,
          notifyOtherParty: true,
        }

        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { post } = useApi()
          const response = await post<{ data: Booking }>(`/bookings/${id}/reschedule`, payload)
          if (index !== -1) {
            this.bookings[index] = response.data
          }
          if (this.currentBooking?.id === id) {
            this.currentBooking = response.data
          }
          bookingLogger.info('Booking rescheduled', { bookingId: id, rescheduledBy })
          return response.data
        } else {
          await queueAction('RESCHEDULE_BOOKING', { id, ...payload })
          bookingLogger.info('Reschedule queued for offline sync', { bookingId: id })
          return this.bookings[index] || null
        }
      } catch (e) {
        // Rollback on error
        if (originalBooking && index !== -1) {
          this.bookings[index] = originalBooking
        }
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        bookingLogger.error('Failed to reschedule booking', e, { bookingId: id })
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update booking status
     */
    async updateStatus(
      id: string,
      action: 'accept' | 'start' | 'complete' | 'cancel',
      reason?: string
    ): Promise<boolean> {
      this.isLoading = true
      this.error = null

      const statusMap: Record<string, BookingStatus> = {
        accept: 'accepted',
        start: 'in_progress',
        complete: 'completed',
        cancel: 'cancelled',
      }

      const index = this.bookings.findIndex(b => b.id === id)
      const originalStatus = index !== -1 ? this.bookings[index].status : null

      try {
        // Optimistic update
        if (index !== -1) {
          this.bookings[index].status = statusMap[action]
          if (reason && action === 'cancel') {
            this.bookings[index].cancellationReason = reason
          }
        }

        const { isOnline } = useOffline()
        if (isOnline.value) {
          const { post } = useApi()
          const body = reason ? { reason } : undefined
          await post(`/bookings/${id}/${action}`, body)
          bookingLogger.info('Booking status updated', { bookingId: id, action })
          return true
        } else {
          await queueAction('UPDATE_STATUS', { id, status: action, reason })
          return true
        }
      } catch (e) {
        // Rollback
        if (originalStatus && index !== -1) {
          this.bookings[index].status = originalStatus
        }
        const { getErrorMessage } = useApi()
        this.error = getErrorMessage(e)
        bookingLogger.error('Failed to update booking status', e, { bookingId: id })
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Convenience status update methods
     */
    acceptBooking(id: string) {
      return this.updateStatus(id, 'accept')
    },
    startBooking(id: string) {
      return this.updateStatus(id, 'start')
    },
    completeBooking(id: string) {
      return this.updateStatus(id, 'complete')
    },
    cancelBooking(id: string, reason?: string) {
      return this.updateStatus(id, 'cancel', reason)
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Reset store state
     */
    $reset() {
      this.bookings = []
      this.currentBooking = null
      this.isLoading = false
      this.error = null
      this.lastFetchedAt = null
    },
  },
})
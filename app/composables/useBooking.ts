import type {
  Booking,
  CreateBookingPayload,
  UpdateBookingPayload,
  BookingStatus,
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

/**
 * Composable for booking operations
 * Handles CRUD operations with offline-first support
 */
export function useBooking() {
  const { get, post, put, getErrorMessage } = useApi()
  const { isOnline } = useOffline()

  // State
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch user's bookings with offline fallback
   */
  const fetchBookings = async (params?: {
    status?: BookingStatus
    page?: number
  }): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // First, load from cache for instant UI
      const cached = await getCachedBookings()
      if (cached.length > 0) {
        bookings.value = cached
      }

      // If online, fetch fresh data
      if (isOnline.value) {
        const response = await get<PaginatedResponse<Booking>>('/bookings', params)
        bookings.value = response.data

        // Update cache
        await cacheBookings(response.data)
      }
    } catch (e) {
      // If we have cached data, don't show error
      if (bookings.value.length === 0) {
        error.value = getErrorMessage(e)
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single booking by ID
   */
  const fetchBooking = async (id: string): Promise<Booking | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      const cached = await getCachedBookings()
      const cachedBooking = cached.find(b => b.id === id || b.offlineId === id)

      if (cachedBooking && !isOnline.value) {
        currentBooking.value = cachedBooking
        return cachedBooking
      }

      // Fetch from server
      if (isOnline.value) {
        const response = await get<{ data: Booking }>(`/bookings/${id}`)
        currentBooking.value = response.data
        return response.data
      }

      return cachedBooking || null
    } catch (e) {
      error.value = getErrorMessage(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new booking with offline support
   */
  const createBooking = async (data: CreateBookingPayload): Promise<Booking | null> => {
    isLoading.value = true
    error.value = null

    const localId = generateLocalId()

    // Create optimistic booking
    const optimisticBooking: Booking = {
      id: localId,
      customerId: '', // Will be filled by server
      providerId: data.providerId,
      serviceId: data.serviceId,
      locationId: '', // Will be filled by server
      status: 'pending',
      scheduledAt: data.scheduledAt,
      quotedAmount: 0, // Will be calculated by server
      customerNotes: data.notes,
      offlineId: localId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      // Add to local state immediately (optimistic UI)
      bookings.value.unshift(optimisticBooking)
      currentBooking.value = optimisticBooking

      // Save to IndexedDB
      await addLocalBooking(optimisticBooking, localId)

      // If online, sync immediately
      if (isOnline.value) {
        const response = await post<{ data: Booking }>('/bookings', {
          ...data,
          offline_id: localId,
        })

        // Update with server response
        const serverBooking = response.data
        const index = bookings.value.findIndex(b => b.id === localId)
        if (index !== -1) {
          bookings.value[index] = serverBooking
        }
        currentBooking.value = serverBooking

        // Update IndexedDB
        await updateSyncedBooking(localId, serverBooking.id, serverBooking)

        return serverBooking
      } else {
        // Queue for later sync
        await queueAction('CREATE_BOOKING', { ...data, localId })
        return optimisticBooking
      }
    } catch (e) {
      // Remove optimistic booking on error
      bookings.value = bookings.value.filter(b => b.id !== localId)
      currentBooking.value = null
      error.value = getErrorMessage(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing booking
   */
  const updateBooking = async (
    id: string,
    data: UpdateBookingPayload
  ): Promise<Booking | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Optimistic update
      const index = bookings.value.findIndex(b => b.id === id)
      const originalBooking = index !== -1 ? { ...bookings.value[index] } : null

      if (index !== -1) {
        bookings.value[index] = { ...bookings.value[index], ...data }
      }

      if (isOnline.value) {
        const response = await put<{ data: Booking }>(`/bookings/${id}`, data)
        if (index !== -1) {
          bookings.value[index] = response.data
        }
        return response.data
      } else {
        // Queue for later sync
        await queueAction('UPDATE_BOOKING', { id, ...data })
        return bookings.value[index] || null
      }
    } catch (e) {
      // Rollback to original booking on error (avoids full refetch)
      if (originalBooking && index !== -1) {
        bookings.value[index] = originalBooking
      }
      error.value = getErrorMessage(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update booking status
   * API: PATCH /bookings/{booking}/status
   * Body: { status: 'accepted' | 'in_progress' | 'completed' | 'cancelled', reason?: string }
   */
  const updateStatus = async (
    id: string,
    newStatus: BookingStatus,
    reason?: string
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Store original for rollback
      const index = bookings.value.findIndex(b => b.id === id)
      const originalStatus = index !== -1 ? bookings.value[index].status : null

      // Optimistic update
      if (index !== -1) {
        bookings.value[index].status = newStatus
        if (reason && newStatus === 'cancelled') {
          bookings.value[index].cancellationReason = reason
        }
      }

      if (isOnline.value) {
        const { patch } = useApi()
        const body: { status: BookingStatus; reason?: string } = { status: newStatus }
        if (reason) body.reason = reason

        await patch(`/bookings/${id}/status`, body)
        return true
      } else {
        // Queue for later sync
        await queueAction('UPDATE_STATUS', { id, status: newStatus, reason })
        return true
      }
    } catch (e) {
      // Rollback to original status
      const index = bookings.value.findIndex(b => b.id === id)
      if (index !== -1 && originalStatus) {
        bookings.value[index].status = originalStatus
      }
      error.value = getErrorMessage(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Convenience methods for status updates
  const acceptBooking = (id: string) => updateStatus(id, 'accepted')
  const startBooking = (id: string) => updateStatus(id, 'in_progress')
  const completeBooking = (id: string) => updateStatus(id, 'completed')
  const cancelBooking = (id: string, reason?: string) => updateStatus(id, 'cancelled', reason)

  /**
   * Create payment checkout for a booking
   * API: POST /bookings/{booking}/checkout
   * Returns checkout URL for Yoco payment
   */
  const createCheckout = async (bookingId: string): Promise<{ checkoutUrl: string } | null> => {
    isLoading.value = true
    error.value = null

    try {
      if (!isOnline.value) {
        error.value = 'Payment requires an internet connection'
        return null
      }

      const response = await post<{ data: { checkout_url: string } }>(`/bookings/${bookingId}/checkout`)
      return { checkoutUrl: response.data.checkout_url }
    } catch (e) {
      error.value = getErrorMessage(e)
      return null
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

  /**
   * Filter bookings by status
   */
  const getBookingsByStatus = (status: BookingStatus) => {
    return computed(() => bookings.value.filter(b => b.status === status))
  }

  /**
   * Get upcoming bookings
   */
  const upcomingBookings = computed(() => {
    const now = new Date()
    return bookings.value
      .filter(b => new Date(b.scheduledAt) > now && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  })

  /**
   * Get past bookings
   */
  const pastBookings = computed(() => {
    const now = new Date()
    return bookings.value
      .filter(b => new Date(b.scheduledAt) <= now || b.status === 'completed' || b.status === 'cancelled')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  })

  return {
    // State (readonly)
    bookings: readonly(bookings),
    currentBooking: readonly(currentBooking),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    upcomingBookings,
    pastBookings,

    // Methods
    fetchBookings,
    fetchBooking,
    createBooking,
    updateBooking,
    updateStatus,
    acceptBooking,
    startBooking,
    completeBooking,
    cancelBooking,
    createCheckout,
    getBookingsByStatus,
    clearError,
  }
}
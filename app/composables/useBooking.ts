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
      // Rollback on error
      error.value = getErrorMessage(e)
      await fetchBookings() // Refresh from server/cache
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update booking status (accept, start, complete, cancel)
   */
  const updateStatus = async (
    id: string,
    newStatus: 'accept' | 'start' | 'complete' | 'cancel',
    reason?: string
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    const statusMap: Record<string, BookingStatus> = {
      accept: 'accepted',
      start: 'in_progress',
      complete: 'completed',
      cancel: 'cancelled',
    }

    try {
      // Optimistic update
      const index = bookings.value.findIndex(b => b.id === id)
      if (index !== -1) {
        bookings.value[index].status = statusMap[newStatus]
        if (reason && newStatus === 'cancel') {
          bookings.value[index].cancellationReason = reason
        }
      }

      if (isOnline.value) {
        const body = reason ? { reason } : undefined
        await post(`/bookings/${id}/${newStatus}`, body)
        return true
      } else {
        // Queue for later sync
        await queueAction('UPDATE_STATUS', { id, status: newStatus, reason })
        return true
      }
    } catch (e) {
      // Rollback
      error.value = getErrorMessage(e)
      await fetchBookings()
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Convenience methods for status updates
  const acceptBooking = (id: string) => updateStatus(id, 'accept')
  const startBooking = (id: string) => updateStatus(id, 'start')
  const completeBooking = (id: string) => updateStatus(id, 'complete')
  const cancelBooking = (id: string, reason?: string) => updateStatus(id, 'cancel', reason)

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
    acceptBooking,
    startBooking,
    completeBooking,
    cancelBooking,
    getBookingsByStatus,
    clearError,
  }
}
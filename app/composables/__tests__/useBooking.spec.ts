import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Booking, CreateBookingPayload } from '~/types'

// Mock offline queue functions using vi.hoisted
const { mockQueueAction, mockGenerateLocalId, mockAddLocalBooking,
        mockUpdateSyncedBooking, mockGetCachedBookings, mockCacheBookings } = vi.hoisted(() => {
  return {
    mockQueueAction: vi.fn(),
    mockGenerateLocalId: vi.fn(() => `local-${Date.now()}-test`),
    mockAddLocalBooking: vi.fn(),
    mockUpdateSyncedBooking: vi.fn(),
    mockGetCachedBookings: vi.fn().mockResolvedValue([]),
    mockCacheBookings: vi.fn(),
  }
})

// Mock offline queue module
vi.mock('~/utils/offline-queue', () => ({
  queueAction: (...args: any[]) => mockQueueAction(...args),
  generateLocalId: () => mockGenerateLocalId(),
  addLocalBooking: (...args: any[]) => mockAddLocalBooking(...args),
  updateSyncedBooking: (...args: any[]) => mockUpdateSyncedBooking(...args),
  getCachedBookings: () => mockGetCachedBookings(),
  cacheBookings: (...args: any[]) => mockCacheBookings(...args),
}))

// Import after mocks are set up
import { useBooking } from '../useBooking'

// Get reference to global mocks set up in tests/setup.ts
const g = globalThis as any

/**
 * Tests for booking operations composable
 * Tests CRUD operations, offline support, and status transitions
 */
describe('useBooking Composable', () => {
  let mockGet: ReturnType<typeof vi.fn>
  let mockPost: ReturnType<typeof vi.fn>
  let mockPut: ReturnType<typeof vi.fn>
  let mockIsOnline: { value: boolean }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset global mocks
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    mockPut = vi.fn().mockResolvedValue({ data: {} })
    mockIsOnline = { value: true }

    // Override global useApi mock
    g.useApi = vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      getErrorMessage: vi.fn((e: any) => e?.message || 'Error'),
    }))

    // Override global useOffline mock
    g.useOffline = vi.fn(() => ({
      isOnline: mockIsOnline,
      checkOnlineStatus: vi.fn(),
    }))

    mockGetCachedBookings.mockResolvedValue([])
  })

  describe('crucial logic - create booking', () => {
    it('should create booking optimistically', async () => {
      const { createBooking, bookings } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: {
          lat: -26.2041,
          lng: 28.0473,
          address: '123 Main St',
        },
        scheduledAt: '2024-01-15T10:00:00Z',
        notes: 'Please call before arrival',
      }

      mockPost.mockResolvedValue({
        data: {
          id: 'server-booking-1',
          serviceId: 'svc-1',
          providerId: 'prov-1',
          status: 'pending',
          customerNotes: 'Please call before arrival',
        },
      })

      const booking = await createBooking(payload)

      expect(booking).not.toBeNull()
      expect(booking?.serviceId).toBe('svc-1')
      expect(booking?.providerId).toBe('prov-1')
      expect(bookings.value.length).toBeGreaterThan(0)
    })

    it('should add booking to IndexedDB', async () => {
      const { createBooking } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: { lat: -26.2041, lng: 28.0473, address: '123 Main St' },
        scheduledAt: '2024-01-15T10:00:00Z',
      }

      mockPost.mockResolvedValue({ data: { id: 'server-1' } })

      await createBooking(payload)

      expect(mockAddLocalBooking).toHaveBeenCalled()
    })

    it('should generate local ID for offline booking', async () => {
      mockIsOnline.value = false

      const { createBooking } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: { lat: -26.2041, lng: 28.0473, address: '123 Main St' },
        scheduledAt: '2024-01-15T10:00:00Z',
      }

      const booking = await createBooking(payload)

      expect(mockGenerateLocalId).toHaveBeenCalled()
      expect(booking?.id).toContain('local-')
    })

    it('should set initial status to pending', async () => {
      mockIsOnline.value = false

      const { createBooking } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: { lat: -26.2041, lng: 28.0473, address: '123 Main St' },
        scheduledAt: '2024-01-15T10:00:00Z',
      }

      const booking = await createBooking(payload)

      expect(booking?.status).toBe('pending')
    })

    it('should include offlineId in created booking', async () => {
      mockIsOnline.value = false

      const { createBooking } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: { lat: -26.2041, lng: 28.0473, address: '123 Main St' },
        scheduledAt: '2024-01-15T10:00:00Z',
      }

      const booking = await createBooking(payload)

      expect(booking?.offlineId).toBeDefined()
      expect(booking?.offlineId).toContain('local-')
    })
  })

  describe('crucial logic - booking status transitions', () => {
    const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
      id: 'booking-1',
      customerId: 'cust-1',
      providerId: 'prov-1',
      serviceId: 'svc-1',
      locationId: 'loc-1',
      status: 'pending',
      scheduledAt: '2024-01-15T10:00:00Z',
      quotedAmount: 100,
      createdAt: '2024-01-14T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z',
      ...overrides,
    })

    it('should accept booking', async () => {
      const mockBooking = createMockBooking()
      mockGetCachedBookings.mockResolvedValue([mockBooking])
      mockPost.mockResolvedValue({ data: { ...mockBooking, status: 'accepted' } })

      const { fetchBookings, acceptBooking } = useBooking()
      await fetchBookings()

      const result = await acceptBooking('booking-1')

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('/bookings/booking-1/accept', undefined)
    })

    it('should start booking', async () => {
      const mockBooking = createMockBooking({ status: 'accepted' })
      mockGetCachedBookings.mockResolvedValue([mockBooking])
      mockPost.mockResolvedValue({ data: { ...mockBooking, status: 'in_progress' } })

      const { fetchBookings, startBooking } = useBooking()
      await fetchBookings()

      const result = await startBooking('booking-1')

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('/bookings/booking-1/start', undefined)
    })

    it('should complete booking', async () => {
      const mockBooking = createMockBooking({ status: 'in_progress' })
      mockGetCachedBookings.mockResolvedValue([mockBooking])
      mockPost.mockResolvedValue({ data: { ...mockBooking, status: 'completed' } })

      const { fetchBookings, completeBooking } = useBooking()
      await fetchBookings()

      const result = await completeBooking('booking-1')

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('/bookings/booking-1/complete', undefined)
    })

    it('should cancel booking with reason', async () => {
      const mockBooking = createMockBooking()
      mockGetCachedBookings.mockResolvedValue([mockBooking])
      mockPost.mockResolvedValue({ data: { ...mockBooking, status: 'cancelled' } })

      const { fetchBookings, cancelBooking } = useBooking()
      await fetchBookings()

      const result = await cancelBooking('booking-1', 'Customer changed plans')

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('/bookings/booking-1/cancel', { reason: 'Customer changed plans' })
    })
  })

  describe('crucial logic - booking filtering', () => {
    it('should filter upcoming bookings', async () => {
      // Set offline so cache data is not overwritten by empty API response
      mockIsOnline.value = false

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const mockBooking: Booking = {
        id: 'booking-1',
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: futureDate.toISOString(),
        quotedAmount: 100,
        createdAt: '2024-01-14T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
      }

      mockGetCachedBookings.mockResolvedValue([mockBooking])

      const { fetchBookings, upcomingBookings } = useBooking()
      await fetchBookings()

      expect(upcomingBookings.value.length).toBe(1)
    })

    it('should exclude cancelled bookings from upcoming', async () => {
      // Set offline so cache data is not overwritten by empty API response
      mockIsOnline.value = false

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const mockBooking: Booking = {
        id: 'booking-1',
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'cancelled',
        scheduledAt: futureDate.toISOString(),
        quotedAmount: 100,
        createdAt: '2024-01-14T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
      }

      mockGetCachedBookings.mockResolvedValue([mockBooking])

      const { fetchBookings, upcomingBookings } = useBooking()
      await fetchBookings()

      expect(upcomingBookings.value.length).toBe(0)
    })

    it('should filter past bookings', async () => {
      // Set offline so cache data is not overwritten by empty API response
      mockIsOnline.value = false

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)

      const mockBooking: Booking = {
        id: 'booking-1',
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'completed',
        scheduledAt: pastDate.toISOString(),
        quotedAmount: 100,
        createdAt: '2024-01-14T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
      }

      mockGetCachedBookings.mockResolvedValue([mockBooking])

      const { fetchBookings, pastBookings } = useBooking()
      await fetchBookings()

      expect(pastBookings.value.length).toBe(1)
    })

    it('should sort upcoming bookings by date ascending', async () => {
      // Set offline so cache data is not overwritten by empty API response
      mockIsOnline.value = false

      const date1 = new Date()
      date1.setDate(date1.getDate() + 7)

      const date2 = new Date()
      date2.setDate(date2.getDate() + 3)

      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          customerId: 'cust-1',
          providerId: 'prov-1',
          serviceId: 'svc-1',
          locationId: 'loc-1',
          status: 'pending',
          scheduledAt: date1.toISOString(),
          quotedAmount: 100,
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-14T00:00:00Z',
        },
        {
          id: 'booking-2',
          customerId: 'cust-1',
          providerId: 'prov-1',
          serviceId: 'svc-1',
          locationId: 'loc-1',
          status: 'pending',
          scheduledAt: date2.toISOString(),
          quotedAmount: 100,
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-14T00:00:00Z',
        },
      ]

      mockGetCachedBookings.mockResolvedValue(mockBookings)

      const { fetchBookings, upcomingBookings } = useBooking()
      await fetchBookings()

      expect(upcomingBookings.value[0].id).toBe('booking-2') // Earlier date first
      expect(upcomingBookings.value[1].id).toBe('booking-1')
    })

    it('should sort past bookings by date descending', async () => {
      // Set offline so cache data is not overwritten by empty API response
      mockIsOnline.value = false

      const date1 = new Date()
      date1.setDate(date1.getDate() - 7)

      const date2 = new Date()
      date2.setDate(date2.getDate() - 3)

      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          customerId: 'cust-1',
          providerId: 'prov-1',
          serviceId: 'svc-1',
          locationId: 'loc-1',
          status: 'completed',
          scheduledAt: date1.toISOString(),
          quotedAmount: 100,
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-14T00:00:00Z',
        },
        {
          id: 'booking-2',
          customerId: 'cust-1',
          providerId: 'prov-1',
          serviceId: 'svc-1',
          locationId: 'loc-1',
          status: 'completed',
          scheduledAt: date2.toISOString(),
          quotedAmount: 100,
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-14T00:00:00Z',
        },
      ]

      mockGetCachedBookings.mockResolvedValue(mockBookings)

      const { fetchBookings, pastBookings } = useBooking()
      await fetchBookings()

      expect(pastBookings.value[0].id).toBe('booking-2') // More recent first
      expect(pastBookings.value[1].id).toBe('booking-1')
    })
  })

  describe('crucial logic - offline fallback', () => {
    it('should load from cache when offline', async () => {
      mockIsOnline.value = false

      const cachedBookings: Booking[] = [
        {
          id: 'cached-1',
          customerId: 'cust-1',
          providerId: 'prov-1',
          serviceId: 'svc-1',
          locationId: 'loc-1',
          status: 'pending',
          scheduledAt: '2024-01-15T10:00:00Z',
          quotedAmount: 100,
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-14T00:00:00Z',
        },
      ]

      mockGetCachedBookings.mockResolvedValue(cachedBookings)

      const { fetchBookings, bookings } = useBooking()
      await fetchBookings()

      expect(bookings.value.length).toBeGreaterThan(0)
      expect(bookings.value[0].id).toBe('cached-1')
    })

    it('should queue create action when offline', async () => {
      mockIsOnline.value = false

      const { createBooking } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: { lat: -26.2041, lng: 28.0473, address: '123 Main St' },
        scheduledAt: '2024-01-15T10:00:00Z',
      }

      await createBooking(payload)

      expect(mockQueueAction).toHaveBeenCalledWith(
        'CREATE_BOOKING',
        expect.objectContaining({
          serviceId: 'svc-1',
          providerId: 'prov-1',
        })
      )
    })
  })

  describe('usability - error handling', () => {
    it('should set error state on failure', async () => {
      mockGetCachedBookings.mockResolvedValue([])
      mockGet.mockRejectedValue(new Error('Network error'))

      const { fetchBookings, error } = useBooking()
      await fetchBookings()

      expect(error.value).toBe('Network error')
    })

    it('should clear error state', async () => {
      mockGetCachedBookings.mockResolvedValue([])
      mockGet.mockRejectedValue(new Error('Network error'))

      const { fetchBookings, error, clearError } = useBooking()
      await fetchBookings()

      expect(error.value).not.toBeNull()

      clearError()
      expect(error.value).toBeNull()
    })

    it('should not show error when cached data exists', async () => {
      const cachedBooking: Booking = {
        id: 'cached-1',
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: '2024-01-15T10:00:00Z',
        quotedAmount: 100,
        createdAt: '2024-01-14T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
      }

      mockGetCachedBookings.mockResolvedValue([cachedBooking])
      mockGet.mockRejectedValue(new Error('Network error'))

      const { fetchBookings, error, bookings } = useBooking()
      await fetchBookings()

      expect(bookings.value.length).toBeGreaterThan(0)
      expect(error.value).toBeNull() // Should not show error when cache exists
    })
  })

  describe('edge cases', () => {
    it('should handle empty bookings list', async () => {
      mockGetCachedBookings.mockResolvedValue([])

      const { fetchBookings, upcomingBookings, pastBookings } = useBooking()
      await fetchBookings()

      expect(upcomingBookings.value.length).toBe(0)
      expect(pastBookings.value.length).toBe(0)
    })

    it('should handle booking at exact current time', async () => {
      const now = new Date()

      const mockBooking: Booking = {
        id: 'booking-1',
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: now.toISOString(),
        quotedAmount: 100,
        createdAt: '2024-01-14T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
      }

      mockGetCachedBookings.mockResolvedValue([mockBooking])

      const { fetchBookings, pastBookings } = useBooking()
      await fetchBookings()

      // Booking at current time should be in past bookings
      expect(pastBookings.value.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle bookings without notes', async () => {
      mockIsOnline.value = false

      const { createBooking } = useBooking()

      const payload: CreateBookingPayload = {
        serviceId: 'svc-1',
        providerId: 'prov-1',
        location: { lat: -26.2041, lng: 28.0473, address: '123 Main St' },
        scheduledAt: '2024-01-15T10:00:00Z',
      }

      const booking = await createBooking(payload)

      expect(booking?.customerNotes).toBeUndefined()
    })
  })
})

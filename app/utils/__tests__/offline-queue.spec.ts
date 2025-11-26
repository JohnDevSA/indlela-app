import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  generateLocalId,
  queueAction,
  getPendingCount,
  getPendingActions,
  removeAction,
  updateActionRetry,
  processQueue,
  cacheProviders,
  getCachedProviders,
  cacheBookings,
  getCachedBookings,
  addLocalBooking,
  updateSyncedBooking,
  clearAllCache,
  clearExpiredCache,
  db,
} from '../offline-queue'
import type { QueuedAction, Booking, Provider, SyncResult } from '~/types'
import { BUSINESS_RULES } from '~/types'

/**
 * Tests for offline queue and sync mechanisms
 * Critical for ensuring data integrity in offline-first architecture
 */
describe('Offline Queue System', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearAllCache()
  })

  afterEach(async () => {
    await clearAllCache()
  })

  describe('crucial logic - local ID generation', () => {
    it('should generate unique local IDs', () => {
      const id1 = generateLocalId()
      const id2 = generateLocalId()

      expect(id1).toMatch(/^local-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^local-\d+-[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with correct format', () => {
      const id = generateLocalId()

      expect(id).toContain('local-')
      expect(id.split('-').length).toBe(3)
    })

    it('should generate unique IDs even in rapid succession', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateLocalId())
      }

      expect(ids.size).toBe(100)
    })
  })

  describe('crucial logic - queue management', () => {
    it('should add action to queue', async () => {
      const localId = await queueAction('CREATE_BOOKING', {
        serviceId: 'svc-1',
        providerId: 'prov-1',
      })

      expect(localId).toMatch(/^local-/)

      const count = await getPendingCount()
      expect(count).toBe(1)
    })

    it('should retrieve all pending actions', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })
      await queueAction('UPDATE_BOOKING', { bookingId: '2' })

      const actions = await getPendingActions()

      expect(actions.length).toBe(2)
      expect(actions[0].type).toBe('CREATE_BOOKING')
      expect(actions[1].type).toBe('UPDATE_BOOKING')
    })

    it('should track retry count', async () => {
      const localId = await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const actions = await getPendingActions()
      const action = actions[0]

      expect(action.retryCount).toBe(0)
    })

    it('should remove action from queue', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const actions = await getPendingActions()
      const actionId = actions[0].id!

      await removeAction(actionId)

      const count = await getPendingCount()
      expect(count).toBe(0)
    })

    it('should update retry count and error', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const actions = await getPendingActions()
      const actionId = actions[0].id!

      await updateActionRetry(actionId, 3, 'Network error')

      const updatedActions = await getPendingActions()
      expect(updatedActions[0].retryCount).toBe(3)
      expect(updatedActions[0].lastError).toBe('Network error')
    })
  })

  describe('crucial logic - queue processing', () => {
    it('should process actions successfully', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })
      await queueAction('UPDATE_BOOKING', { bookingId: '2' })

      const syncFn = vi.fn(async (action: QueuedAction): Promise<SyncResult> => {
        return {
          localId: action.localId,
          serverId: `server-${action.localId}`,
          status: 'synced',
        }
      })

      const results = await processQueue(syncFn)

      expect(results.length).toBe(2)
      expect(results[0].status).toBe('synced')
      expect(results[1].status).toBe('synced')
      expect(syncFn).toHaveBeenCalledTimes(2)

      // Actions should be removed after successful sync
      const count = await getPendingCount()
      expect(count).toBe(0)
    })

    it('should handle sync failures with retry', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const syncFn = vi.fn(async (): Promise<SyncResult> => {
        throw new Error('Network error')
      })

      const results = await processQueue(syncFn)

      // No results returned for retryable failures (action stays in queue)
      expect(results.length).toBe(0)

      // Action should still be in queue with incremented retry count
      const actions = await getPendingActions()
      expect(actions.length).toBe(1)
      expect(actions[0].retryCount).toBe(1)
      expect(actions[0].lastError).toBe('Network error')
    })

    it('should remove action after max retries', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      // Set retry count to 4 (next failure will be the 5th)
      const actions = await getPendingActions()
      await updateActionRetry(actions[0].id!, 4, 'Previous error')

      const syncFn = vi.fn(async (): Promise<SyncResult> => {
        throw new Error('Network error')
      })

      const results = await processQueue(syncFn)

      expect(results[0].status).toBe('failed')

      // Action should be removed after max retries
      const count = await getPendingCount()
      expect(count).toBe(0)
    })

    it('should respect max retry limit from BUSINESS_RULES', async () => {
      expect(BUSINESS_RULES.MAX_RETRY_ATTEMPTS).toBe(5)

      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const syncFn = vi.fn(async (): Promise<SyncResult> => {
        throw new Error('Network error')
      })

      // Process queue 6 times
      for (let i = 0; i < 6; i++) {
        await processQueue(syncFn)
      }

      // After 5 failures, action should be removed
      const count = await getPendingCount()
      expect(count).toBe(0)
    })

    it('should handle already_synced status', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const syncFn = vi.fn(async (action: QueuedAction): Promise<SyncResult> => {
        return {
          localId: action.localId,
          status: 'already_synced',
        }
      })

      await processQueue(syncFn)

      // Action should be removed for already_synced status
      const count = await getPendingCount()
      expect(count).toBe(0)
    })
  })

  describe('crucial logic - booking caching', () => {
    it('should cache bookings locally', async () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          customerId: 'cust-1',
          providerId: 'prov-1',
          serviceId: 'svc-1',
          locationId: 'loc-1',
          status: 'pending',
          scheduledAt: '2024-01-01T10:00:00Z',
          quotedAmount: 100,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T09:00:00Z',
        },
      ]

      await cacheBookings(bookings)

      const cached = await getCachedBookings()
      expect(cached.length).toBe(1)
      expect(cached[0].id).toBe('booking-1')
    })

    it('should add local booking (unsynced)', async () => {
      const localId = generateLocalId()
      const booking: Booking = {
        id: localId,
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: '2024-01-01T10:00:00Z',
        quotedAmount: 100,
        offlineId: localId,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
      }

      await addLocalBooking(booking, localId)

      const cached = await getCachedBookings()
      expect(cached.length).toBe(1)
      expect(cached[0].offlineId).toBe(localId)
    })

    it('should update synced booking', async () => {
      const localId = generateLocalId()
      const booking: Booking = {
        id: localId,
        customerId: 'cust-1',
        providerId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: '2024-01-01T10:00:00Z',
        quotedAmount: 100,
        offlineId: localId,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
      }

      await addLocalBooking(booking, localId)

      const serverBooking: Booking = {
        ...booking,
        id: 'server-123',
      }

      await updateSyncedBooking(localId, 'server-123', serverBooking)

      const cached = await getCachedBookings()
      expect(cached[0].id).toBe('server-123')
    })
  })

  describe('crucial logic - provider caching', () => {
    it('should cache providers locally', async () => {
      const providers: Provider[] = [
        {
          id: 'prov-1',
          userId: 'user-1',
          rating: 4.5,
          totalReviews: 10,
          totalJobs: 25,
          status: 'verified',
          serviceRadiusKm: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      await cacheProviders(providers)

      const cached = await getCachedProviders()
      expect(cached.length).toBe(1)
      expect(cached[0].id).toBe('prov-1')
      expect(cached[0].rating).toBe(4.5)
    })

    it('should update existing cached providers', async () => {
      const providers: Provider[] = [
        {
          id: 'prov-1',
          userId: 'user-1',
          rating: 4.5,
          totalReviews: 10,
          totalJobs: 25,
          status: 'verified',
          serviceRadiusKm: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      await cacheProviders(providers)

      const updatedProviders: Provider[] = [
        {
          ...providers[0],
          rating: 4.8,
          totalReviews: 15,
        },
      ]

      await cacheProviders(updatedProviders)

      const cached = await getCachedProviders()
      expect(cached.length).toBe(1)
      expect(cached[0].rating).toBe(4.8)
      expect(cached[0].totalReviews).toBe(15)
    })
  })

  describe('crucial logic - cache cleanup', () => {
    it('should clear all cache', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })
      await cacheProviders([
        {
          id: 'prov-1',
          userId: 'user-1',
          rating: 4.5,
          totalReviews: 10,
          totalJobs: 25,
          status: 'verified',
          serviceRadiusKm: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ])

      await clearAllCache()

      const queueCount = await getPendingCount()
      const providers = await getCachedProviders()

      expect(queueCount).toBe(0)
      expect(providers.length).toBe(0)
    })

    it('should clear expired cache items', async () => {
      // This test requires mocking dates or waiting, simplified for now
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      await cacheProviders([
        {
          id: 'prov-1',
          userId: 'user-1',
          rating: 4.5,
          totalReviews: 10,
          totalJobs: 25,
          status: 'verified',
          serviceRadiusKm: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ])

      // Clear cache older than 24 hours
      await clearExpiredCache(maxAge)

      // Since we just cached, nothing should be expired
      const providers = await getCachedProviders()
      expect(providers.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty queue', async () => {
      const count = await getPendingCount()
      expect(count).toBe(0)

      const actions = await getPendingActions()
      expect(actions.length).toBe(0)
    })

    it('should handle multiple actions of same type', async () => {
      await queueAction('CREATE_BOOKING', { bookingId: '1' })
      await queueAction('CREATE_BOOKING', { bookingId: '2' })
      await queueAction('CREATE_BOOKING', { bookingId: '3' })

      const count = await getPendingCount()
      expect(count).toBe(3)
    })

    it('should handle localId in payload', async () => {
      const customLocalId = 'custom-local-123'

      const localId = await queueAction('CREATE_BOOKING', {
        localId: customLocalId,
        bookingId: '1',
      })

      expect(localId).toBe(customLocalId)
    })

    it('should preserve action creation timestamps', async () => {
      const beforeTime = new Date()

      await queueAction('CREATE_BOOKING', { bookingId: '1' })

      const actions = await getPendingActions()
      const createdAt = actions[0].createdAt

      const afterTime = new Date()

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })

    it('should handle complex payload data', async () => {
      const complexPayload = {
        bookingId: '1',
        nested: {
          data: {
            value: 123,
          },
        },
        array: [1, 2, 3],
      }

      await queueAction('CREATE_BOOKING', complexPayload)

      const actions = await getPendingActions()
      expect(actions[0].payload.nested).toEqual({ data: { value: 123 } })
      expect(actions[0].payload.array).toEqual([1, 2, 3])
    })
  })

  describe('offline action types', () => {
    it('should support all offline action types', async () => {
      await queueAction('CREATE_BOOKING', { data: '1' })
      await queueAction('UPDATE_BOOKING', { data: '2' })
      await queueAction('UPDATE_STATUS', { data: '3' })
      await queueAction('CREATE_REVIEW', { data: '4' })

      const actions = await getPendingActions()
      const types = actions.map(a => a.type)

      expect(types).toContain('CREATE_BOOKING')
      expect(types).toContain('UPDATE_BOOKING')
      expect(types).toContain('UPDATE_STATUS')
      expect(types).toContain('CREATE_REVIEW')
    })
  })
})

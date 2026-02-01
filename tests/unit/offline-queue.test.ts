/**
 * Unit Tests for app/utils/offline-queue.ts
 *
 * Tests offline queue management including:
 * - Queue operations (add, remove, count, get pending)
 * - LocalId generation and validation (empty string, whitespace handling)
 * - Retry logic (5 max retries, 4xx vs 5xx handling)
 * - Retriable vs non-retriable error detection
 * - Cache management (providers, bookings, services)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  db,
  generateLocalId,
  queueAction,
  getPendingCount,
  getPendingActions,
  removeAction,
  updateActionRetry,
  processQueue,
  clearAllCache,
  clearExpiredCache,
  cacheProviders,
  getCachedProviders,
  cacheBookings,
  getCachedBookings,
  addLocalBooking,
  updateSyncedBooking,
  cacheServices,
  getCachedServices,
} from '~/utils/offline-queue'
import type { QueuedAction, SyncResult, Provider, Booking, Service } from '~/types'

describe('app/utils/offline-queue', () => {
  beforeEach(async () => {
    // Clear all IndexedDB tables before each test
    await clearAllCache()
  })

  describe('generateLocalId - Crucial Logic', () => {
    it('should generate unique IDs with "local-" prefix', () => {
      const id1 = generateLocalId()
      const id2 = generateLocalId()

      expect(id1).toMatch(/^local-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^local-\d+-[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with timestamp component', () => {
      const beforeTime = Date.now()
      const id = generateLocalId()
      const afterTime = Date.now()

      // Extract timestamp from ID format: local-{timestamp}-{random}
      const timestamp = parseInt(id.split('-')[1])
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should generate IDs with random component for uniqueness', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateLocalId())
      }

      // All 100 IDs should be unique
      expect(ids.size).toBe(100)
    })

    it('should generate IDs that are valid strings', () => {
      const id = generateLocalId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('queueAction - Crucial Logic', () => {
    it('should add action to queue with generated localId', async () => {
      const payload = {
        serviceId: 'srv-1',
        providerId: 'prov-1',
        scheduledAt: new Date().toISOString(),
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      expect(localId).toMatch(/^local-\d+-[a-z0-9]+$/)

      const pendingActions = await getPendingActions()
      expect(pendingActions).toHaveLength(1)
      expect(pendingActions[0].type).toBe('CREATE_BOOKING')
      expect(pendingActions[0].localId).toBe(localId)
      expect(pendingActions[0].retryCount).toBe(0)
    })

    it('should normalize empty string localId to generated ID', async () => {
      const payload = {
        localId: '', // Empty string should be replaced
        serviceId: 'srv-1',
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      expect(localId).toMatch(/^local-\d+-[a-z0-9]+$/)
      expect(localId).not.toBe('')

      const pendingActions = await getPendingActions()
      expect(pendingActions[0].localId).toBe(localId)
      expect(pendingActions[0].payload.localId).toBe(localId)
    })

    it('should normalize whitespace-only localId to generated ID', async () => {
      const payload = {
        localId: '   ', // Whitespace should be replaced
        serviceId: 'srv-1',
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      expect(localId).toMatch(/^local-\d+-[a-z0-9]+$/)
      expect(localId.trim()).toBe(localId) // No whitespace

      const pendingActions = await getPendingActions()
      expect(pendingActions[0].localId).toBe(localId)
    })

    it('should preserve valid provided localId', async () => {
      const customLocalId = 'custom-local-id-123'
      const payload = {
        localId: customLocalId,
        serviceId: 'srv-1',
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      expect(localId).toBe(customLocalId)

      const pendingActions = await getPendingActions()
      expect(pendingActions[0].localId).toBe(customLocalId)
    })

    it('should trim provided localId', async () => {
      const payload = {
        localId: '  valid-id  ',
        serviceId: 'srv-1',
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      expect(localId).toBe('valid-id')
      expect(localId).not.toContain(' ')
    })

    it('should handle undefined localId', async () => {
      const payload = {
        serviceId: 'srv-1',
        // No localId field
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      expect(localId).toMatch(/^local-\d+-[a-z0-9]+$/)
    })

    it('should set createdAt timestamp', async () => {
      const beforeTime = new Date()
      const localId = await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      const afterTime = new Date()

      const pendingActions = await getPendingActions()
      const action = pendingActions[0]

      expect(action.createdAt).toBeInstanceOf(Date)
      expect(action.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(action.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })

    it('should initialize retryCount to 0', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const pendingActions = await getPendingActions()
      expect(pendingActions[0].retryCount).toBe(0)
    })

    it('should support different action types', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('UPDATE_BOOKING', { id: 'bk-1', status: 'completed' })
      await queueAction('UPDATE_STATUS', { id: 'bk-1', status: 'accepted' })
      await queueAction('CREATE_REVIEW', { bookingId: 'bk-1', rating: 5 })

      const pendingActions = await getPendingActions()
      expect(pendingActions).toHaveLength(4)
      expect(pendingActions.map(a => a.type)).toEqual([
        'CREATE_BOOKING',
        'UPDATE_BOOKING',
        'UPDATE_STATUS',
        'CREATE_REVIEW',
      ])
    })
  })

  describe('Queue Operations - Crucial Logic', () => {
    it('should get pending count', async () => {
      expect(await getPendingCount()).toBe(0)

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      expect(await getPendingCount()).toBe(1)

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })
      expect(await getPendingCount()).toBe(2)
    })

    it('should get all pending actions in order', async () => {
      const id1 = await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      const id2 = await queueAction('UPDATE_BOOKING', { id: 'bk-1' })

      const pendingActions = await getPendingActions()

      expect(pendingActions).toHaveLength(2)
      expect(pendingActions[0].localId).toBe(id1)
      expect(pendingActions[1].localId).toBe(id2)
    })

    it('should remove action by ID', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      const actions = await getPendingActions()
      const actionId = actions[0].id!

      await removeAction(actionId)

      expect(await getPendingCount()).toBe(0)
    })

    it('should update action retry count and error', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      const actions = await getPendingActions()
      const actionId = actions[0].id!

      await updateActionRetry(actionId, 3, 'Network timeout')

      const updatedActions = await getPendingActions()
      expect(updatedActions[0].retryCount).toBe(3)
      expect(updatedActions[0].lastError).toBe('Network timeout')
    })

    it('should handle removing non-existent action gracefully', async () => {
      await expect(removeAction(99999)).resolves.not.toThrow()
    })
  })

  describe('processQueue - Retry Logic (Crucial)', () => {
    it('should process successful actions and remove from queue', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const syncFn = vi.fn().mockResolvedValue({
        localId: 'test-id',
        serverId: 'bk-123',
        status: 'synced',
      } as SyncResult)

      const results = await processQueue(syncFn)

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('synced')
      expect(await getPendingCount()).toBe(0)
    })

    it('should remove already_synced actions from queue', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const syncFn = vi.fn().mockResolvedValue({
        localId: 'test-id',
        status: 'already_synced',
      } as SyncResult)

      await processQueue(syncFn)

      expect(await getPendingCount()).toBe(0)
    })

    it('should remove failed actions from queue', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const syncFn = vi.fn().mockResolvedValue({
        localId: 'test-id',
        status: 'failed',
        error: 'Invalid data',
      } as SyncResult)

      const results = await processQueue(syncFn)

      expect(results[0].status).toBe('failed')
      expect(await getPendingCount()).toBe(0)
    })

    it('should immediately remove action on 4xx client errors (non-retriable)', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const clientError = new Error('Bad request')
      Object.assign(clientError, { status: 400 })

      const syncFn = vi.fn().mockRejectedValue(clientError)

      const results = await processQueue(syncFn)

      expect(results[0].status).toBe('failed')
      expect(results[0].error).toContain('Non-retriable')
      expect(await getPendingCount()).toBe(0)
    })

    it('should immediately remove action on 404 not found errors', async () => {
      await queueAction('UPDATE_BOOKING', { id: 'non-existent' })

      const notFoundError = new Error('Not found')
      Object.assign(notFoundError, { status: 404 })

      const syncFn = vi.fn().mockRejectedValue(notFoundError)

      const results = await processQueue(syncFn)

      expect(results[0].status).toBe('failed')
      expect(await getPendingCount()).toBe(0)
    })

    it('should retry on 408 timeout errors (retriable 4xx)', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const timeoutError = new Error('Request timeout')
      Object.assign(timeoutError, { status: 408 })

      const syncFn = vi.fn().mockRejectedValue(timeoutError)

      await processQueue(syncFn)

      // Should increment retry count, not remove
      const actions = await getPendingActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].retryCount).toBe(1)
      expect(actions[0].lastError).toContain('timeout')
    })

    it('should retry on 429 rate limit errors (retriable 4xx)', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const rateLimitError = new Error('Too many requests')
      Object.assign(rateLimitError, { status: 429 })

      const syncFn = vi.fn().mockRejectedValue(rateLimitError)

      await processQueue(syncFn)

      // Should increment retry count, not remove
      const actions = await getPendingActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].retryCount).toBe(1)
    })

    it('should retry on 5xx server errors', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const serverError = new Error('Internal server error')
      Object.assign(serverError, { status: 500 })

      const syncFn = vi.fn().mockRejectedValue(serverError)

      await processQueue(syncFn)

      const actions = await getPendingActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].retryCount).toBe(1)
    })

    it('should retry on network errors (TypeError with fetch)', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const networkError = new TypeError('Failed to fetch')

      const syncFn = vi.fn().mockRejectedValue(networkError)

      await processQueue(syncFn)

      const actions = await getPendingActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].retryCount).toBe(1)
      expect(actions[0].lastError).toContain('fetch')
    })

    it('should remove action after 5 failed retries (max retries)', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const networkError = new Error('Network error')

      const syncFn = vi.fn().mockRejectedValue(networkError)

      // Process 5 times
      for (let i = 0; i < 5; i++) {
        await processQueue(syncFn)

        if (i < 4) {
          const actions = await getPendingActions()
          expect(actions).toHaveLength(1)
          expect(actions[0].retryCount).toBe(i + 1)
        }
      }

      // After 5th retry, should be removed
      expect(await getPendingCount()).toBe(0)
    })

    it('should handle statusCode field as alternative to status', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const error = new Error('Bad request')
      Object.assign(error, { statusCode: 400 })

      const syncFn = vi.fn().mockRejectedValue(error)

      await processQueue(syncFn)

      expect(await getPendingCount()).toBe(0) // Should be removed as non-retriable
    })

    it('should process multiple actions sequentially', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-3' })

      const syncFn = vi.fn().mockResolvedValue({
        localId: 'test',
        status: 'synced',
      } as SyncResult)

      const results = await processQueue(syncFn)

      expect(results).toHaveLength(3)
      expect(syncFn).toHaveBeenCalledTimes(3)
      expect(await getPendingCount()).toBe(0)
    })

    it('should continue processing remaining actions if one fails', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-3' })

      let callCount = 0
      const syncFn = vi.fn().mockImplementation((action: QueuedAction) => {
        callCount++
        if (callCount === 2) {
          const error = new Error('Server error')
          Object.assign(error, { status: 500 })
          return Promise.reject(error)
        }
        return Promise.resolve({
          localId: action.localId,
          status: 'synced'
        } as SyncResult)
      })

      const results = await processQueue(syncFn)

      // Results array length depends on error handling:
      // - 2 successful syncs return results
      // - 1 failed action does NOT add to results array when it will retry
      expect(results.length).toBeGreaterThanOrEqual(2)
      expect(syncFn).toHaveBeenCalledTimes(3)
      expect(await getPendingCount()).toBe(1) // One failed with retry
    })
  })

  describe('Cache Management - Crucial Logic', () => {
    it('should cache and retrieve providers', async () => {
      const providers: Provider[] = [
        {
          id: 'prov-1',
          userId: 'user-1',
          rating: 4.5,
          totalReviews: 10,
          totalJobs: 50,
          status: 'verified',
          serviceRadiusKm: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      await cacheProviders(providers)

      const cached = await getCachedProviders()
      expect(cached).toHaveLength(1)
      expect(cached[0].id).toBe('prov-1')
      expect(cached[0].rating).toBe(4.5)
    })

    it('should cache and retrieve bookings', async () => {
      const bookings: Booking[] = [
        {
          id: 'bk-1',
          customerId: 'cust-1',
          serviceId: 'srv-1',
          locationId: 'loc-1',
          status: 'pending',
          scheduledAt: new Date().toISOString(),
          quotedAmount: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      await cacheBookings(bookings)

      const cached = await getCachedBookings()
      expect(cached).toHaveLength(1)
      expect(cached[0].id).toBe('bk-1')
      expect(cached[0].status).toBe('pending')
    })

    it('should add local (unsynced) booking', async () => {
      const localId = generateLocalId()
      const booking: Booking = {
        id: localId,
        customerId: 'cust-1',
        serviceId: 'srv-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: new Date().toISOString(),
        quotedAmount: 120,
        offlineId: localId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addLocalBooking(booking, localId)

      const cached = await getCachedBookings()
      expect(cached).toHaveLength(1)
      expect(cached[0].offlineId).toBe(localId)
    })

    it('should update booking after sync with server ID', async () => {
      const localId = generateLocalId()
      const booking: Booking = {
        id: localId,
        customerId: 'cust-1',
        serviceId: 'srv-1',
        locationId: 'loc-1',
        status: 'pending',
        scheduledAt: new Date().toISOString(),
        quotedAmount: 120,
        offlineId: localId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addLocalBooking(booking, localId)

      // Simulate successful sync
      const serverId = 'bk-server-123'
      const syncedBooking = { ...booking, id: serverId }

      await updateSyncedBooking(localId, serverId, syncedBooking)

      const cached = await getCachedBookings()
      expect(cached).toHaveLength(1)
      expect(cached[0].id).toBe(serverId)
    })

    it('should cache and retrieve services', async () => {
      const services: Service[] = [
        {
          id: 'srv-1',
          categoryId: 'cat-1',
          name: 'Plumbing',
          basePrice: 150,
        },
      ]

      await cacheServices(services)

      const cached = await getCachedServices()
      expect(cached).toHaveLength(1)
      expect(cached[0].name).toBe('Plumbing')
    })

    it('should clear all cache on logout', async () => {
      // Add data to all caches
      await cacheProviders([{
        id: 'prov-1',
        userId: 'user-1',
        rating: 5,
        totalReviews: 1,
        totalJobs: 1,
        status: 'verified',
        serviceRadiusKm: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      expect(await getPendingCount()).toBeGreaterThan(0)
      expect(await getCachedProviders()).toHaveLength(1)

      await clearAllCache()

      expect(await getPendingCount()).toBe(0)
      expect(await getCachedProviders()).toHaveLength(0)
    })

    it('should clear expired cache items (default 24 hours)', async () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago

      // Manually insert old provider
      await db.providers.add({
        id: 'old-prov',
        data: {
          id: 'old-prov',
          userId: 'user-1',
          rating: 5,
          totalReviews: 1,
          totalJobs: 1,
          status: 'verified',
          serviceRadiusKm: 10,
          createdAt: oldDate.toISOString(),
          updatedAt: oldDate.toISOString(),
        },
        cachedAt: oldDate,
      })

      // Add recent provider
      await cacheProviders([{
        id: 'new-prov',
        userId: 'user-2',
        rating: 4,
        totalReviews: 1,
        totalJobs: 1,
        status: 'verified',
        serviceRadiusKm: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])

      expect(await getCachedProviders()).toHaveLength(2)

      await clearExpiredCache()

      const remaining = await getCachedProviders()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('new-prov')
    })

    it('should clear expired cache with custom max age', async () => {
      const oneHourAgo = new Date(Date.now() - 61 * 60 * 1000) // 61 minutes ago

      await db.services.add({
        id: 'old-srv',
        data: {
          id: 'old-srv',
          categoryId: 'cat-1',
          name: 'Old Service',
          basePrice: 100,
        },
        cachedAt: oneHourAgo,
      })

      await cacheServices([{
        id: 'new-srv',
        categoryId: 'cat-1',
        name: 'New Service',
        basePrice: 100,
      }])

      expect(await getCachedServices()).toHaveLength(2)

      // Clear items older than 1 hour
      await clearExpiredCache(60 * 60 * 1000)

      const remaining = await getCachedServices()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('new-srv')
    })
  })

  describe('Business Rules & Edge Cases', () => {
    it('should handle commission calculation in booking payload', async () => {
      const quotedAmount = 100
      const commissionRate = 0.12 // 12%
      const commissionAmount = quotedAmount * commissionRate

      const payload = {
        serviceId: 'srv-1',
        quotedAmount,
        commissionAmount,
        providerPayout: quotedAmount - commissionAmount,
      }

      const localId = await queueAction('CREATE_BOOKING', payload)

      const actions = await getPendingActions()
      expect(actions[0].payload.commissionAmount).toBe(12)
      expect(actions[0].payload.providerPayout).toBe(88)
    })

    it('should handle offline booking with valid localId format', async () => {
      const localId = generateLocalId()
      const payload = {
        localId,
        serviceId: 'srv-1',
        offlineId: localId,
      }

      await queueAction('CREATE_BOOKING', payload)

      const actions = await getPendingActions()
      expect(actions[0].localId).toBe(localId)
      expect(actions[0].payload.offlineId).toBe(localId)
    })

    it('should handle empty queue gracefully', async () => {
      const syncFn = vi.fn()

      const results = await processQueue(syncFn)

      expect(results).toHaveLength(0)
      expect(syncFn).not.toHaveBeenCalled()
    })

    it('should handle empty cache retrieval', async () => {
      expect(await getCachedProviders()).toHaveLength(0)
      expect(await getCachedBookings()).toHaveLength(0)
      expect(await getCachedServices()).toHaveLength(0)
    })

    it('should handle cache update (bulkPut replaces existing)', async () => {
      const provider: Provider = {
        id: 'prov-1',
        userId: 'user-1',
        rating: 4.5,
        totalReviews: 10,
        totalJobs: 50,
        status: 'verified',
        serviceRadiusKm: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await cacheProviders([provider])
      expect((await getCachedProviders())[0].rating).toBe(4.5)

      // Update rating
      const updated = { ...provider, rating: 5.0 }
      await cacheProviders([updated])

      const cached = await getCachedProviders()
      expect(cached).toHaveLength(1)
      expect(cached[0].rating).toBe(5.0)
    })
  })
})
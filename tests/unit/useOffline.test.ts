/**
 * Unit Tests for app/composables/useOffline.ts
 *
 * Tests offline state management including:
 * - Sync locking (prevents concurrent sync operations)
 * - Debounced online/offline status (500ms debounce)
 * - clearOfflineData (privacy protection on logout)
 * - Sync result handling (synced, failed, already_synced)
 * - Action validation (missing payload, invalid IDs)
 * - Network status transitions
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, createDeferred } from '../utils/nuxt-mocks'
import type { QueuedAction, SyncResult } from '~/types'

// Mock offline-queue to avoid slow IndexedDB operations
const mockQueueActions: QueuedAction[] = []
const mockClearAllCache = vi.fn().mockResolvedValue(undefined)
const mockGetPendingCount = vi.fn().mockImplementation(() => Promise.resolve(mockQueueActions.length))
const mockQueueAction = vi.fn().mockImplementation((type, payload) => {
  const localId = payload.localId || `local-${Date.now()}-test`
  mockQueueActions.push({
    id: mockQueueActions.length + 1,
    type,
    payload: { ...payload, localId },
    localId,
    createdAt: new Date(),
    retryCount: 0,
  })
  return Promise.resolve(localId)
})
const mockGetPendingActions = vi.fn().mockImplementation(() => Promise.resolve([...mockQueueActions]))
const mockRemoveAction = vi.fn().mockImplementation((id) => {
  const idx = mockQueueActions.findIndex(a => a.id === id)
  if (idx !== -1) mockQueueActions.splice(idx, 1)
  return Promise.resolve()
})
const mockProcessQueue = vi.fn()
const mockClearExpiredCache = vi.fn().mockResolvedValue(undefined)

vi.mock('~/utils/offline-queue', () => ({
  db: { queue: { count: () => Promise.resolve(0) } },
  queueAction: (...args: any[]) => mockQueueAction(...args),
  clearAllCache: () => mockClearAllCache(),
  getPendingCount: () => mockGetPendingCount(),
  getPendingActions: () => mockGetPendingActions(),
  removeAction: (id: number) => mockRemoveAction(id),
  processQueue: (...args: any[]) => mockProcessQueue(...args),
  clearExpiredCache: (...args: any[]) => mockClearExpiredCache(...args),
  generateLocalId: () => `local-${Date.now()}-test`,
}))

// Mock useApi composable
const mockPost = vi.fn()
const mockPut = vi.fn()

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    post: mockPost,
    put: mockPut,
  }),
}))

// Import the mocked composable
import { useOffline } from '~/composables/useOffline'

// Aliases for easier use in tests
const queueAction = mockQueueAction
const getPendingCount = mockGetPendingCount
const clearAllCache = mockClearAllCache
const db = {
  queue: {
    add: vi.fn().mockImplementation((action) => {
      mockQueueActions.push({ ...action, id: mockQueueActions.length + 1 })
      return Promise.resolve(mockQueueActions.length)
    }),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}

describe('app/composables/useOffline', () => {
  let onlineListeners: ((event: Event) => void)[] = []
  let offlineListeners: ((event: Event) => void)[] = []

  beforeEach(async () => {
    // Clear mock queue data
    mockQueueActions.length = 0
    vi.clearAllMocks()

    // Setup event listener tracking
    onlineListeners = []
    offlineListeners = []

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    // Mock window.addEventListener/removeEventListener
    const originalAddEventListener = window.addEventListener
    const originalRemoveEventListener = window.removeEventListener

    window.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'online') {
        onlineListeners.push(handler)
      } else if (event === 'offline') {
        offlineListeners.push(handler)
      }
      return originalAddEventListener.call(window, event, handler)
    })

    window.removeEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'online') {
        onlineListeners = onlineListeners.filter(l => l !== handler)
      } else if (event === 'offline') {
        offlineListeners = offlineListeners.filter(l => l !== handler)
      }
      return originalRemoveEventListener.call(window, event, handler)
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Online Status - Crucial Logic', () => {
    it('should initialize online status from navigator.onLine', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })

      const { isOnline } = useOffline()

      expect(isOnline.value).toBe(true)
    })

    it('should initialize offline status from navigator.onLine', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

      const { isOnline } = useOffline()

      expect(isOnline.value).toBe(false)
    })

    it('should debounce online status changes by 500ms', async () => {
      vi.useFakeTimers()
      const { isOnline } = useOffline()

      expect(isOnline.value).toBe(true)

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      offlineListeners.forEach(listener => listener(new Event('offline')))

      // Should not update immediately
      expect(isOnline.value).toBe(true)

      // Advance by 499ms - still not updated
      vi.advanceTimersByTime(499)
      expect(isOnline.value).toBe(true)

      // Advance by 1ms more (total 500ms) - now updated
      vi.advanceTimersByTime(1)
      expect(isOnline.value).toBe(false)

      vi.useRealTimers()
    })

    it('should cancel pending debounce on rapid status changes', async () => {
      vi.useFakeTimers()
      const { isOnline } = useOffline()

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      offlineListeners.forEach(listener => listener(new Event('offline')))

      vi.advanceTimersByTime(200)

      // Go back online before debounce completes
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      onlineListeners.forEach(listener => listener(new Event('online')))

      vi.advanceTimersByTime(200)

      // Go offline again
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      offlineListeners.forEach(listener => listener(new Event('offline')))

      // Complete final debounce
      vi.advanceTimersByTime(500)

      // Should only apply final state
      expect(isOnline.value).toBe(false)

      vi.useRealTimers()
    })

    it('should trigger sync when coming back online after debounce', async () => {
      vi.useFakeTimers()

      // Add action to queue
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { isOnline } = useOffline()

      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      offlineListeners.forEach(listener => listener(new Event('offline')))
      vi.advanceTimersByTime(500)

      // Come back online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      onlineListeners.forEach(listener => listener(new Event('online')))
      vi.advanceTimersByTime(500)

      // Allow async sync to complete
      await vi.runAllTimersAsync()
      await flushPromises()

      // Sync should have been triggered
      expect(mockPost).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Sync Locking - Crucial Logic', () => {
    it('should prevent concurrent sync calls using lock', async () => {
      const deferred = createDeferred<SyncResult[]>()

      // Add actions to queue
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })

      // Mock slow sync
      mockPost.mockImplementation(() => deferred.promise)

      const { syncPendingActions, isSyncing } = useOffline()

      // Start first sync
      const sync1Promise = syncPendingActions()
      expect(isSyncing.value).toBe(true)

      // Start second sync immediately (should return same promise)
      const sync2Promise = syncPendingActions()

      // Both should be the same promise due to lock
      expect(sync1Promise).toBe(sync2Promise)

      // Complete the sync
      deferred.resolve([
        { localId: 'id-1', status: 'synced', serverId: 'bk-1' },
        { localId: 'id-2', status: 'synced', serverId: 'bk-2' },
      ])

      await sync1Promise
      expect(isSyncing.value).toBe(false)
    })

    it('should allow new sync after previous completes', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { syncPendingActions } = useOffline()

      // First sync
      const results1 = await syncPendingActions()
      expect(results1).toHaveLength(1)

      // Add new action
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })

      // Second sync should work
      const results2 = await syncPendingActions()
      expect(results2).toHaveLength(1)
    })

    it('should release lock even if sync fails', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockRejectedValue(new Error('Network error'))

      const { syncPendingActions, isSyncing, syncError } = useOffline()

      await syncPendingActions()

      expect(isSyncing.value).toBe(false)
      expect(syncError.value).toContain('failed')
    })

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(0)
      expect(mockPost).not.toHaveBeenCalled()
    })
  })

  describe('syncAction - Validation (Crucial)', () => {
    it('should fail when payload is missing', async () => {
      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { syncPendingActions } = useOffline()

      // Manually add action with invalid payload
      await db.queue.add({
        type: 'CREATE_BOOKING',
        payload: null as any,
        localId: 'test-id',
        createdAt: new Date(),
        retryCount: 0,
      })

      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('failed')
      expect(results[0].error).toContain('Invalid payload')
    })

    it('should fail when payload is not an object', async () => {
      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { syncPendingActions } = useOffline()

      await db.queue.add({
        type: 'CREATE_BOOKING',
        payload: 'string payload' as any,
        localId: 'test-id',
        createdAt: new Date(),
        retryCount: 0,
      })

      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('failed')
      expect(results[0].error).toContain('Invalid payload')
    })

    it('should sync CREATE_BOOKING action', async () => {
      mockPost.mockResolvedValue({ data: { id: 'bk-server-123' } })

      await queueAction('CREATE_BOOKING', {
        serviceId: 'srv-1',
        providerId: 'prov-1',
        scheduledAt: new Date().toISOString(),
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('synced')
      expect(results[0].serverId).toBe('bk-server-123')
      expect(mockPost).toHaveBeenCalledWith('/bookings', expect.objectContaining({
        serviceId: 'srv-1',
        providerId: 'prov-1',
      }))
    })

    it('should sync UPDATE_BOOKING action with valid ID', async () => {
      mockPut.mockResolvedValue({ success: true })

      await queueAction('UPDATE_BOOKING', {
        id: 'bk-123',
        status: 'completed',
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('synced')
      expect(mockPut).toHaveBeenCalledWith('/bookings/bk-123', expect.objectContaining({
        id: 'bk-123',
        status: 'completed',
      }))
    })

    it('should fail UPDATE_BOOKING when booking ID is missing', async () => {
      await queueAction('UPDATE_BOOKING', {
        status: 'completed',
        // Missing id field
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('failed')
      expect(results[0].error).toContain('Missing booking ID')
    })

    it('should sync UPDATE_STATUS action', async () => {
      mockPost.mockResolvedValue({ success: true })

      await queueAction('UPDATE_STATUS', {
        id: 'bk-123',
        status: 'accepted',
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('synced')
      expect(mockPost).toHaveBeenCalledWith('/bookings/bk-123/accepted')
    })

    it('should fail UPDATE_STATUS when ID or status is missing', async () => {
      await queueAction('UPDATE_STATUS', {
        id: 'bk-123',
        // Missing status
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('failed')
      expect(results[0].error).toContain('Missing booking ID or status')
    })

    it('should sync CREATE_REVIEW action', async () => {
      mockPost.mockResolvedValue({ success: true })

      await queueAction('CREATE_REVIEW', {
        bookingId: 'bk-123',
        rating: 5,
        comment: 'Excellent service',
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('synced')
      expect(mockPost).toHaveBeenCalledWith('/bookings/bk-123/review', expect.objectContaining({
        bookingId: 'bk-123',
        rating: 5,
      }))
    })

    it('should fail CREATE_REVIEW when booking ID is missing', async () => {
      await queueAction('CREATE_REVIEW', {
        rating: 5,
        // Missing bookingId
      })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('failed')
      expect(results[0].error).toContain('Missing booking ID for review')
    })

    it('should throw error for unknown action type', async () => {
      await db.queue.add({
        type: 'UNKNOWN_ACTION' as any,
        payload: { test: 'data' },
        localId: 'test-id',
        createdAt: new Date(),
        retryCount: 0,
      })

      const { syncPendingActions, syncError } = useOffline()
      await syncPendingActions()

      expect(syncError.value).toContain('failed')
    })
  })

  describe('Pending Count - Crucial Logic', () => {
    it('should initialize pending count to 0', () => {
      const { pendingCount } = useOffline()

      expect(pendingCount.value).toBe(0)
    })

    it('should update pending count after sync', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })

      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { syncPendingActions, pendingCount } = useOffline()

      // Update pending count manually before sync
      await useOffline().updatePendingCount()
      expect(pendingCount.value).toBe(2)

      await syncPendingActions()

      expect(pendingCount.value).toBe(0)
    })

    it('should provide hasPendingChanges computed property', async () => {
      const { hasPendingChanges } = useOffline()

      expect(hasPendingChanges.value).toBe(false)

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await useOffline().updatePendingCount()

      expect(hasPendingChanges.value).toBe(true)
    })
  })

  describe('clearOfflineData - Privacy Protection (Crucial)', () => {
    it('should clear all cache and reset state', async () => {
      // Add data to queue
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('CREATE_REVIEW', { bookingId: 'bk-1', rating: 5 })

      const { clearOfflineData, pendingCount, lastSyncAt } = useOffline()

      lastSyncAt.value = new Date()

      await clearOfflineData()

      expect(await getPendingCount()).toBe(0)
      expect(pendingCount.value).toBe(0)
      expect(lastSyncAt.value).toBe(null)
    })

    it('should handle clearOfflineData failure gracefully', async () => {
      // Mock clearAllCache to fail
      vi.spyOn(db.queue, 'clear').mockRejectedValueOnce(new Error('IndexedDB error'))

      const { clearOfflineData } = useOffline()

      await expect(clearOfflineData()).rejects.toThrow('IndexedDB error')
    })
  })

  describe('Cache Cleanup - Usability Logic', () => {
    it('should clean up expired cache with default max age', async () => {
      const { cleanupCache } = useOffline()

      // cleanupCache should complete without error
      await expect(cleanupCache()).resolves.not.toThrow()
    })

    it('should clean up cache with custom max age', async () => {
      const { cleanupCache } = useOffline()

      // 1 hour max age
      await expect(cleanupCache(60 * 60 * 1000)).resolves.not.toThrow()
    })
  })

  describe('forceSync - Usability Logic', () => {
    it('should sync when online', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { forceSync } = useOffline()
      const results = await forceSync()

      expect(results).toHaveLength(1)
      expect(mockPost).toHaveBeenCalled()
    })

    it('should fail with error when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      const { forceSync, syncError } = useOffline()
      const results = await forceSync()

      expect(results).toHaveLength(0)
      expect(syncError.value).toBe('Cannot sync while offline')
    })
  })

  describe('Sync Results - Crucial Logic', () => {
    it('should track last sync timestamp', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { syncPendingActions, lastSyncAt } = useOffline()

      const beforeSync = new Date()
      await syncPendingActions()
      const afterSync = new Date()

      expect(lastSyncAt.value).not.toBe(null)
      expect(lastSyncAt.value!.getTime()).toBeGreaterThanOrEqual(beforeSync.getTime())
      expect(lastSyncAt.value!.getTime()).toBeLessThanOrEqual(afterSync.getTime())
    })

    it('should clear sync error on successful sync', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const { syncPendingActions, syncError } = useOffline()

      // Set an error
      syncError.value = 'Previous error'

      await syncPendingActions()

      expect(syncError.value).toBe(null)
    })

    it('should set sync error on failure', async () => {
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })

      mockPost.mockRejectedValue(new Error('Network timeout'))

      const { syncPendingActions, syncError } = useOffline()

      await syncPendingActions()

      expect(syncError.value).toContain('failed')
    })

    it('should return empty results when no actions to sync', async () => {
      const { syncPendingActions } = useOffline()

      const results = await syncPendingActions()

      expect(results).toHaveLength(0)
    })
  })

  describe('Business Rules & Edge Cases', () => {
    it('should handle commission calculation in CREATE_BOOKING payload', async () => {
      mockPost.mockResolvedValue({ data: { id: 'bk-123' } })

      const quotedAmount = 100
      const commissionAmount = quotedAmount * 0.12 // 12%

      await queueAction('CREATE_BOOKING', {
        serviceId: 'srv-1',
        quotedAmount,
        commissionAmount,
      })

      const { syncPendingActions } = useOffline()
      await syncPendingActions()

      expect(mockPost).toHaveBeenCalledWith('/bookings', expect.objectContaining({
        quotedAmount: 100,
        commissionAmount: 12,
      }))
    })

    it('should handle multiple action types in queue', async () => {
      mockPost.mockResolvedValue({ data: { id: 'test' } })
      mockPut.mockResolvedValue({ success: true })

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('UPDATE_BOOKING', { id: 'bk-1', status: 'completed' })
      await queueAction('UPDATE_STATUS', { id: 'bk-2', status: 'accepted' })
      await queueAction('CREATE_REVIEW', { bookingId: 'bk-3', rating: 5 })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(4)
      expect(results.every(r => r.status === 'synced')).toBe(true)
    })

    it('should handle partial sync failures', async () => {
      let callCount = 0
      mockPost.mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          const error = new Error('Server error')
          Object.assign(error, { status: 500 })
          return Promise.reject(error)
        }
        return Promise.resolve({ data: { id: 'bk-123' } })
      })

      await queueAction('CREATE_BOOKING', { serviceId: 'srv-1' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-2' })
      await queueAction('CREATE_BOOKING', { serviceId: 'srv-3' })

      const { syncPendingActions } = useOffline()
      const results = await syncPendingActions()

      expect(results).toHaveLength(3)

      const syncedCount = results.filter(r => r.status === 'synced').length
      expect(syncedCount).toBe(2)
    })

    it('should handle empty action queue', async () => {
      const { syncPendingActions, isSyncing } = useOffline()

      const results = await syncPendingActions()

      expect(results).toHaveLength(0)
      expect(isSyncing.value).toBe(false)
    })
  })
})
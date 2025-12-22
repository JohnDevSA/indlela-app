import {
  db,
  getPendingCount,
  processQueue,
  clearAllCache,
  clearExpiredCache,
} from '~/utils/offline-queue'
import type { QueuedAction, SyncResult } from '~/types'

/**
 * Composable for managing offline state and sync
 * Provides reactive online/offline status and sync utilities
 */
export function useOffline() {
  // State
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const isSyncing = ref(false)
  const pendingCount = ref(0)
  const lastSyncAt = ref<Date | null>(null)
  const syncError = ref<string | null>(null)

  // Non-reactive lock to prevent concurrent sync calls
  let syncLock: Promise<SyncResult[]> | null = null

  // Debounce timer for online status changes
  let statusDebounceTimer: ReturnType<typeof setTimeout> | null = null

  // Update online status with debounce to prevent rapid-fire sync calls
  const updateOnlineStatus = () => {
    // Clear any pending debounce
    if (statusDebounceTimer) {
      clearTimeout(statusDebounceTimer)
    }

    // Debounce by 500ms to handle rapid online/offline flicker
    statusDebounceTimer = setTimeout(() => {
      isOnline.value = navigator.onLine

      if (isOnline.value) {
        // Trigger sync when coming back online
        syncPendingActions()
      }
    }, 500)
  }

  // Update pending count
  const updatePendingCount = async () => {
    pendingCount.value = await getPendingCount()
  }

  // Sync pending actions with the server
  const syncPendingActions = async (): Promise<SyncResult[]> => {
    // Return existing sync promise if already running (prevents race condition)
    if (syncLock) {
      return syncLock
    }

    if (!isOnline.value) {
      return []
    }

    // Create locked sync operation
    syncLock = (async () => {
      isSyncing.value = true
      syncError.value = null

      try {
        const results = await processQueue(syncAction)
        await updatePendingCount()
        lastSyncAt.value = new Date()
        return results
      } catch (error) {
        syncError.value = error instanceof Error ? error.message : 'Sync failed'
        return []
      } finally {
        isSyncing.value = false
        syncLock = null
      }
    })()

    return syncLock
  }

  // Sync a single action
  const syncAction = async (action: QueuedAction): Promise<SyncResult> => {
    // Validate payload exists
    if (!action.payload || typeof action.payload !== 'object') {
      return {
        localId: action.localId,
        status: 'failed',
        error: 'Invalid payload: payload is missing or not an object',
      }
    }

    const { post, put } = useApi()

    switch (action.type) {
      case 'CREATE_BOOKING': {
        const response = await post<{ data: { id: string } }>('/bookings', action.payload)
        return {
          localId: action.localId,
          serverId: response.data.id,
          status: 'synced',
          data: response.data,
        }
      }

      case 'UPDATE_BOOKING': {
        const bookingId = action.payload.id as string
        if (!bookingId) {
          return { localId: action.localId, status: 'failed', error: 'Missing booking ID' }
        }
        await put(`/bookings/${bookingId}`, action.payload)
        return {
          localId: action.localId,
          status: 'synced',
        }
      }

      case 'UPDATE_STATUS': {
        const bookingId = action.payload.id as string
        const status = action.payload.status as string
        if (!bookingId || !status) {
          return { localId: action.localId, status: 'failed', error: 'Missing booking ID or status' }
        }
        await post(`/bookings/${bookingId}/${status}`)
        return {
          localId: action.localId,
          status: 'synced',
        }
      }

      case 'CREATE_REVIEW': {
        const bookingId = action.payload.bookingId as string
        if (!bookingId) {
          return { localId: action.localId, status: 'failed', error: 'Missing booking ID for review' }
        }
        await post(`/bookings/${bookingId}/review`, action.payload)
        return {
          localId: action.localId,
          status: 'synced',
        }
      }

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // Force sync (manual refresh)
  const forceSync = async (): Promise<SyncResult[]> => {
    if (!isOnline.value) {
      syncError.value = 'Cannot sync while offline'
      return []
    }
    return syncPendingActions()
  }

  // Clear offline data (for logout)
  const clearOfflineData = async (): Promise<void> => {
    await clearAllCache()
    pendingCount.value = 0
    lastSyncAt.value = null
  }

  // Clean up expired cache
  const cleanupCache = async (maxAgeMs?: number): Promise<void> => {
    await clearExpiredCache(maxAgeMs)
  }

  // Check if there are pending changes
  const hasPendingChanges = computed(() => pendingCount.value > 0)

  // Register event listeners on mount
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)

      // Initial count and sync
      updatePendingCount()

      if (isOnline.value) {
        // Sync on mount if online
        syncPendingActions()
        // Clean up old cache
        cleanupCache()
      }
    }
  })

  // Clean up event listeners and timers on unmount
  onUnmounted(() => {
    if (statusDebounceTimer) {
      clearTimeout(statusDebounceTimer)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  })

  return {
    // State (readonly)
    isOnline: readonly(isOnline),
    isSyncing: readonly(isSyncing),
    pendingCount: readonly(pendingCount),
    lastSyncAt: readonly(lastSyncAt),
    syncError: readonly(syncError),
    hasPendingChanges,

    // Methods
    syncPendingActions,
    forceSync,
    clearOfflineData,
    cleanupCache,
    updatePendingCount,
  }
}